"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-5" action={action}>
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
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">
            PASSWORD
          </label>

          <Link href="/forgot-password" className="text-xs text-blue-600">
            Forgot password?
          </Link>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" />

        <span className="text-sm text-gray-600">
          Remember me for 30 days
        </span>
      </div>

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#041B3A] py-3 font-medium text-white transition hover:bg-[#072955] disabled:opacity-60"
      >
        {pending ? "Signing In…" : "Sign In"}
        <ArrowRight size={18} />
      </button>

      <div className="relative py-2">
        <div className="absolute left-0 top-1/2 h-px w-full bg-gray-200" />
        <span className="relative bg-white px-3 text-xs text-gray-400">
          OR CONTINUE WITH
        </span>
      </div>

      <a
        href="/api/auth/google"
        className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.28-2.1 3.57-5.2 3.57-8.81z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.89-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.26A7.2 7.2 0 0 1 4.9 12c0-.78.13-1.54.37-2.26V6.63H1.26A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.26 5.37l4.01-3.11z"
          />
          <path
            fill="#EA4335"
            d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.63l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
          />
        </svg>
        Continue with Google
      </a>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-blue-600">
          Create one
        </Link>
      </p>
    </form>
  );
}
