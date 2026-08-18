"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.message) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#eef4ff]">
          <Mail size={26} className="text-[#041B3A]" />
        </div>
        <h2 className="text-xl font-bold text-[#041B3A]">Check your email</h2>
        <p className="text-sm text-gray-500">{state.message}</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" action={action}>
      <div>
        <h2 className="text-xl font-bold text-[#041B3A]">Forgot your password?</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          EMAIL ADDRESS
        </label>

        <input
          type="email"
          name="email"
          placeholder="name@gmail.com"
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#041B3A] py-3 font-medium text-white transition hover:bg-[#072955] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Reset Link"}
        <ArrowRight size={18} />
      </button>

      <p className="text-center text-sm text-gray-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-blue-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
