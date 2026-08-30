"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { saveCompanyProfile, completeProfileSetup } from "@/app/actions/profile";
import ProductsManager, { type SavedProduct } from "@/components/dashboard/ProductsManager";
import ReferenceWebsitesManager, { type SavedReferenceWebsite } from "@/components/dashboard/ReferenceWebsitesManager";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const inputClass =
  "h-12 w-full rounded-md border border-[#d5d7dd] bg-white px-4 text-base text-black outline-none placeholder:text-neutral-400 focus:border-black";

export default function ProfileSetupWizard({
  email,
  fullName,
  companyName,
  website,
  products,
  referenceWebsites,
}: {
  email: string;
  fullName: string;
  companyName: string;
  website: string;
  products: SavedProduct[];
  referenceWebsites: SavedReferenceWebsite[];
}) {
  const { dictionary: t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [state, action, pending] = useActionState(saveCompanyProfile, undefined);
  const [companyNameInput, setCompanyNameInput] = useState(companyName);
  const [websiteInput, setWebsiteInput] = useState(website);
  const [noWebsite, setNoWebsite] = useState(false);

  useEffect(() => {
    if (state?.message && !state.errors) setStep(2);
  }, [state]);

  return (
    <div className="mx-auto max-w-xl">
      {step === 1 ? (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">{t.profileSetup.welcomeTitle}</h1>
          <p className="mt-2 text-neutral-500">{t.profileSetup.signingUpAs.replace("{email}", email)}</p>

          <form action={action} className="mt-10 space-y-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">{t.profileSetup.fullName}</span>
              <input name="fullName" defaultValue={fullName} placeholder={t.profileSetup.fullNamePlaceholder} className={inputClass} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">
                {t.profileSetup.companyName}<span className="ml-0.5 text-red-500">*</span>
              </span>
              <input
                name="companyName"
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                placeholder={t.profileSetup.companyNamePlaceholder}
                className={inputClass}
              />
              {state?.errors?.companyName && <p className="mt-2 text-sm text-red-600">{state.errors.companyName[0]}</p>}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-neutral-700">{t.profileSetup.companyWebsite}</span>
              <input
                name="website"
                value={noWebsite ? "" : websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                readOnly={noWebsite}
                placeholder={t.profileSetup.companyWebsitePlaceholder}
                className={`${inputClass} ${noWebsite ? "cursor-not-allowed opacity-50" : ""}`}
              />
              <span className="mt-2 block text-sm text-neutral-500">{t.profileSetup.websiteHelp}</span>
              {state?.errors?.website && <p className="mt-2 text-sm text-red-600">{state.errors.website[0]}</p>}
            </label>

            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={noWebsite} onChange={(e) => setNoWebsite(e.target.checked)} />
              {t.profileSetup.noCompanyWebsite}
            </label>

            {state?.message && !state.errors && <p className="text-sm text-neutral-500">{state.message}</p>}

            <button
              type="submit"
              disabled={pending || companyNameInput.trim().length === 0}
              className="w-full rounded-md bg-black py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {pending ? t.profileSetup.saving : t.profileSetup.continueButton}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">{t.profileSetup.step2Title}</h1>
          <p className="mt-2 text-neutral-500">
            {t.profileSetup.step2Subtitle}
          </p>

          <div className="mt-10 space-y-10">
            <div>
              <h2 className="mb-4 text-lg font-bold text-black">{t.profileSetup.products}</h2>
              <ProductsManager products={products} />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-black">{t.profileSetup.referenceWebsites}</h2>
              <ReferenceWebsitesManager websites={referenceWebsites} />
            </div>
          </div>

          <form action={completeProfileSetup} className="mt-10">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-black py-3 font-bold text-white"
            >
              {t.profileSetup.continueToDashboard} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
