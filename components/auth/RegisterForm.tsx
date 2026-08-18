"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { register } from "@/app/actions/auth";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form className="space-y-5" action={action}>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          COMPANY NAME
        </label>

        <input
          type="text"
          name="companyName"
          placeholder="Acme Exports Ltd."
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
        {state?.errors?.companyName && (
          <p className="mt-1 text-xs text-red-600">{state.errors.companyName[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          YOUR NAME
        </label>

        <input
          type="text"
          name="name"
          placeholder="Jane Doe"
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
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

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          PASSWORD
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
          CONFIRM PASSWORD
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
        {pending ? "Creating Account…" : "Create Account"}
        <ArrowRight size={18} />
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
