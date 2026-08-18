"use client";

import { useActionState } from "react";

import { updateProfile } from "@/app/actions/auth";

export default function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="space-y-6">
      <label className="block">
        <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Full Name</span>
        <input
          name="name"
          defaultValue={name}
          className="h-14 w-full border border-[#d5d7dd] bg-white px-5 text-lg outline-none"
        />
      </label>

      {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name[0]}</p>}
      {state?.message && <p className="text-sm text-[#5b6300]">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-5 py-3 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
