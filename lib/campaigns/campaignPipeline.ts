import "server-only";

import { prisma } from "@/lib/prisma";
import { generateMessageVariants } from "@/lib/leadfinder/groq";
import { mergeTemplate } from "@/lib/campaigns/personalize";
import { sendCampaignEmail } from "@/lib/campaigns/email";

const DEFAULT_SEND_RATE_PER_MINUTE = 20;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildHtml(body: string, unsubscribeUrl: string, fromName: string): string {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("\n");

  return `${paragraphs}
<hr style="margin-top:24px;border:none;border-top:1px solid #ddd;">
<p style="font-size:12px;color:#888;">You received this email from ${fromName}. If you'd rather not hear from us again, <a href="${unsubscribeUrl}">unsubscribe here</a>.</p>`;
}

export async function runEmailCampaign(campaignId: string): Promise<void> {
  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
      include: { recipients: true },
    });
    if (!campaign) return;

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "SENDING", startedAt: new Date() },
    });

    let variants = campaign.messageVariants;
    if (variants.length === 0) {
      variants = await generateMessageVariants(campaign.bodyTemplate);
      await prisma.emailCampaign.update({ where: { id: campaignId }, data: { messageVariants: variants } });
    }

    const attachment =
      campaign.attachmentData && campaign.attachmentName
        ? { filename: campaign.attachmentName, content: Buffer.from(campaign.attachmentData) }
        : undefined;

    const rate = campaign.sendRatePerMinute > 0 ? campaign.sendRatePerMinute : DEFAULT_SEND_RATE_PER_MINUTE;
    const delayMs = Math.round(60000 / rate);

    const pendingRecipients = campaign.recipients.filter((r) => r.status === "PENDING");

    for (let i = 0; i < pendingRecipients.length; i++) {
      const recipient = pendingRecipients[i];

      const suppressed = await prisma.emailSuppression.findUnique({
        where: { companyId_email: { companyId: campaign.companyId, email: recipient.email } },
      });

      if (suppressed) {
        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: { status: "UNSUBSCRIBED" },
        });
      } else {
        const name = recipient.contactName ?? "there";
        const company = recipient.companyName ?? "your company";
        const variant = variants[i % variants.length];

        const subject = mergeTemplate(campaign.subject, { name, company });
        const body = mergeTemplate(variant, { name, company });
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/campaigns/unsubscribe?token=${recipient.unsubscribeToken}`;
        const html = buildHtml(body, unsubscribeUrl, campaign.fromName);

        const result = await sendCampaignEmail({
          fromEmail: campaign.fromEmail,
          fromName: campaign.fromName,
          to: recipient.email,
          subject,
          html,
          attachment,
        });

        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: result.success
            ? { status: "SENT", sentAt: new Date() }
            : { status: "FAILED", errorMessage: result.error },
        });
      }

      if (i < pendingRecipients.length - 1) {
        await delay(delayMs);
      }
    }

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  } catch (error) {
    await prisma.emailCampaign
      .update({
        where: { id: campaignId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      })
      .catch(() => {});
  }
}
