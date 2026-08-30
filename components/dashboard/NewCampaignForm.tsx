"use client";

import { useActionState, useMemo, useState } from "react";

import { createCampaign } from "@/app/actions/campaigns";
import { Card, Field } from "@/components/dashboard/DashboardScreens";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ResultRow = {
  id: string;
  companyName: string | null;
  email: string | null;
  contactEmail: string | null;
  contactName: string | null;
};

export default function NewCampaignForm({
  job,
  results,
}: {
  job: { id: string };
  results: ResultRow[];
}) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(createCampaign, undefined);

  const usableResults = useMemo(() => results.filter((r) => r.contactEmail || r.email), [results]);

  const [selected, setSelected] = useState<Set<string>>(new Set(usableResults.map((r) => r.id)));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={action} encType="multipart/form-data">
      <input type="hidden" name="searchJobId" value={job.id} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <Card>
          <div className="mb-8 border-b pb-4 font-mono uppercase tracking-[0.12em]">
            <strong className="border-b-2 border-black pb-3">{t.newCampaignForm.composeEmail}</strong>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <Field label={t.newCampaignForm.fromName} name="fromName" placeholder={t.newCampaignForm.fromNamePlaceholder} />
            <Field label={t.newCampaignForm.fromEmail} name="fromEmail" placeholder={t.newCampaignForm.fromEmailPlaceholder} />
          </div>
          {state?.errors?.fromName && <p className="mt-2 text-sm text-red-600">{state.errors.fromName[0]}</p>}
          {state?.errors?.fromEmail && <p className="mt-2 text-sm text-red-600">{state.errors.fromEmail[0]}</p>}
          <p className="mt-2 text-sm text-neutral-500">
            {t.newCampaignForm.fromEmailHelp}
          </p>

          <div className="mt-8">
            <Field label={t.newCampaignForm.subject} name="subject" placeholder={t.newCampaignForm.subjectPlaceholder} />
            {state?.errors?.subject && <p className="mt-2 text-sm text-red-600">{state.errors.subject[0]}</p>}
          </div>

          <div className="mt-8">
            <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">{t.newCampaignForm.message}</label>
            <textarea
              name="bodyTemplate"
              rows={8}
              placeholder={t.newCampaignForm.messagePlaceholder}
              className="w-full rounded border border-[#d5d7dd] bg-white p-4 text-base outline-none"
            />
            <p className="mt-2 text-sm text-neutral-500">
              {t.newCampaignForm.messageHelp}
            </p>
            {state?.errors?.bodyTemplate && (
              <p className="mt-2 text-sm text-red-600">{state.errors.bodyTemplate[0]}</p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
                {t.newCampaignForm.attachment}
              </label>
              <input
                type="file"
                name="attachment"
                accept=".pdf,.doc,.docx"
                className="text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#041B3A] file:px-5 file:py-2.5 file:font-bold file:text-white file:transition hover:file:bg-[#072955]"
              />
            </div>
            <Field label={t.newCampaignForm.sendRate} name="sendRatePerMinute" type="number" placeholder="20" />
          </div>

          {state?.message && <p className="mt-6 text-sm text-red-600">{state.message}</p>}

          <div className="mt-10 border-t pt-10 text-right">
            <button
              type="submit"
              disabled={pending || selected.size === 0}
              className="inline-flex items-center gap-3 bg-black px-12 py-5 text-xl font-black text-white disabled:opacity-60"
            >
              {pending ? t.newCampaignForm.creating : t.newCampaignForm.reviewCampaign}
            </button>
          </div>
        </Card>

        <Card title={t.newCampaignForm.recipients.replace("{count}", String(selected.size))}>
          {state?.errors?.recipientIds && (
            <p className="mb-4 text-sm text-red-600">{state.errors.recipientIds[0]}</p>
          )}
          {usableResults.length === 0 ? (
            <p className="text-neutral-500">{t.newCampaignForm.noUsableEmails}</p>
          ) : (
            <div className="max-h-[500px] space-y-2 overflow-y-auto">
              {usableResults.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="recipientIds"
                    value={r.id}
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                  />
                  <span>
                    <strong>{r.companyName ?? t.common.unknown}</strong>
                    <span className="block text-neutral-500">{r.contactEmail ?? r.email}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </Card>
      </div>
    </form>
  );
}
