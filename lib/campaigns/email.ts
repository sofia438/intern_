import { Resend } from "resend";

export type CampaignAttachment = {
  filename: string;
  content: Buffer;
};

export async function sendCampaignEmail(input: {
  fromEmail: string;
  fromName: string;
  to: string;
  subject: string;
  html: string;
  attachment?: CampaignAttachment;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: `${input.fromName} <${input.fromEmail}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachment
        ? [{ filename: input.attachment.filename, content: input.attachment.content }]
        : undefined,
    });

    if (error) {
      return { success: false, error: error.message ?? "Unknown error" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
