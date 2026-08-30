"use client";

import { useActionState } from "react";

import { checkout } from "@/app/actions/billing";
import type { Plan } from "@/lib/billing/plans";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR + i);

export default function CheckoutForm({ plan }: { plan: Plan }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(checkout, undefined);

  return (
    <form action={action}>
      <input type="hidden" name="planId" value={plan.id} />

      <div className="rounded-md border border-[#dfe2e7] bg-[#f4f2ee] p-4 text-sm text-neutral-700 dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-300">
        <strong className="dark:text-white">{t.checkoutForm.testModeTitle}</strong> {t.checkoutForm.testModeBody}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-black dark:text-white">{t.checkoutForm.billingInformation}</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t.checkoutForm.fullName} name="fullName" defaultValue={state?.values?.fullName} errors={state?.errors?.fullName} />
          <Field label={t.checkoutForm.country} name="country" defaultValue={state?.values?.country} errors={state?.errors?.country} />
          <Field label={t.checkoutForm.address} name="address" className="sm:col-span-2" defaultValue={state?.values?.address} errors={state?.errors?.address} />
          <Field label={t.checkoutForm.city} name="city" defaultValue={state?.values?.city} errors={state?.errors?.city} />
          <Field label={t.checkoutForm.postalCode} name="postalCode" defaultValue={state?.values?.postalCode} errors={state?.errors?.postalCode} />
          <Field label={t.checkoutForm.taxId} name="taxId" defaultValue={state?.values?.taxId} errors={state?.errors?.taxId} />
          <Field
            label={t.checkoutForm.billingEmail}
            name="billingEmail"
            type="email"
            defaultValue={state?.values?.billingEmail}
            errors={state?.errors?.billingEmail}
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-black dark:text-white">{t.checkoutForm.paymentMethod}</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.checkoutForm.creditDebitCard}</p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={t.checkoutForm.cardNumber} name="cardNumber" className="sm:col-span-2" errors={state?.errors?.cardNumber} />
          <Field label={t.checkoutForm.cardholderName} name="cardholderName" className="sm:col-span-2" errors={state?.errors?.cardholderName} />

          <label className="block">
            <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.checkoutForm.expiryMonth}</span>
            <select name="expiryMonth" className="h-14 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{t.checkoutForm.expiryYear}</span>
            <select name="expiryYear" className="h-14 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100">
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <Field label={t.checkoutForm.cvc} name="cvc" errors={state?.errors?.cvc} />
        </div>
      </div>

      <label className="mt-8 flex items-start gap-3 text-sm dark:text-neutral-300">
        <input type="checkbox" name="agreeTerms" className="mt-1 h-4 w-4" />
        <span>
          {t.checkoutForm.agreeTerms}
        </span>
      </label>
      {state?.errors?.agreeTerms && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.agreeTerms[0]}</p>}

      {state?.message && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 w-full bg-black py-5 text-xl font-black text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-black"
      >
        {pending ? t.checkoutForm.processing : t.checkoutForm.payNow.replace("{price}", String(plan.price))}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  className,
  defaultValue,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  className?: string;
  defaultValue?: string;
  errors?: string[];
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em] dark:text-neutral-300">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="h-14 w-full rounded border border-[#d5d7dd] bg-white px-4 text-base outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
      />
      {errors && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[0]}</p>}
    </label>
  );
}
