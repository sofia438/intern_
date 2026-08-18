"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { resetPassword } from "@/app/actions/auth";

export default function ResetPasswordForm({ token }: { token: string }) {
  const resetPasswordWithToken = resetPassword.bind(null, token);
  const [state, action, pending] = useActionState(resetPasswordWithToken, undefined);

  return (
    <form className="space-y-5" action={action}>
      <div>
        <h2 className="text-xl font-bold text-[#041B3A]">Set a new password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose a new password for your account.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          NEW PASSWORD
        </label>

        <input
          type="password"
          name="password"
          placeholder="••••••••"
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
        {state?.errors?.password && (
          <ul className="mt-1 list-inside list-disc text-xs text-red-600">
            {state.errors.password.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          CONFIRM NEW PASSWORD
        </label>

        <input
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#041B3A] py-3 font-medium text-white transition hover:bg-[#072955] disabled:opacity-60"
      >
        {pending ? "Resetting…" : "Reset Password"}
        <ArrowRight size={18} />
      </button>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-blue-600">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
