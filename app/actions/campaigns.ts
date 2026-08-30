"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { CreateCampaignFormSchema, type FormState } from "@/lib/definitions";
import { runEmailCampaign } from "@/lib/campaigns/campaignPipeline";

const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

export async function createCampaign(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = CreateCampaignFormSchema.safeParse({
    searchJobId: formData.get("searchJobId"),
    fromEmail: formData.get("fromEmail"),
    fromName: formData.get("fromName"),
    subject: formData.get("subject"),
    bodyTemplate: formData.get("bodyTemplate"),
    recipientIds: formData.getAll("recipientIds"),
    sendRatePerMinute: formData.get("sendRatePerMinute") || undefined,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { searchJobId, fromEmail, fromName, subject, bodyTemplate, recipientIds, sendRatePerMinute } =
    validatedFields.data;

  const job = await prisma.searchJob.findUnique({ where: { id: searchJobId } });
  if (!job || job.companyId !== session.companyId || job.searchType !== "WEBSITE" || job.status !== "COMPLETED") {
    return { message: "Select a completed website search to build a campaign from." };
  }

  const allSelected = await prisma.searchResult.findMany({
    where: { id: { in: recipientIds }, searchJobId },
  });
  const selectedResults = allSelected.filter((r) => !!(r.contactEmail || r.email));

  if (selectedResults.length === 0) {
    return { message: "None of the selected companies have a usable email address." };
  }

  let attachmentName: string | undefined;
  let attachmentType: string | undefined;
  let attachmentData: Uint8Array<ArrayBuffer> | undefined;

  const attachment = formData.get("attachment");
  if (attachment instanceof File && attachment.size > 0) {
    if (attachment.size > MAX_ATTACHMENT_BYTES) {
      return { message: "Attachment is too large (max 8MB)." };
    }
    attachmentName = attachment.name;
    attachmentType = attachment.type || undefined;
    
    attachmentData = Uint8Array.from(Buffer.from(await attachment.arrayBuffer())) as Uint8Array<ArrayBuffer>;
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      companyId: session.companyId,
      userId: session.userId,
      searchJobId,
      fromEmail,
      fromName,
      subject,
      bodyTemplate,
      sendRatePerMinute,
      attachmentName,
      attachmentType,
      attachmentData,
      recipients: {
        create: selectedResults.map((r) => ({
          searchResultId: r.id,
          companyName: r.companyName,
          contactName: r.contactName,
          email: (r.contactEmail ?? r.email)!,
        })),
      },
    },
  });

  redirect(`/email-campaigns/${campaign.id}`);
}

export async function startCampaign(formData: FormData): Promise<void> {
  const session = await verifySession();
  const campaignId = formData.get("campaignId");
  if (typeof campaignId !== "string" || !campaignId) return;

  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.companyId !== session.companyId) return;
  if (campaign.status !== "DRAFT") return;

  await prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: "SENDING" } });

  after(() => runEmailCampaign(campaignId));

  revalidatePath(`/email-campaigns/${campaignId}`);
}
