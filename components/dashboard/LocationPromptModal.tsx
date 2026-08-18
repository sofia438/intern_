"use client";

import { useState } from "react";

import { saveUserLocationFromCoords, saveUserLocationFromIp } from "@/app/actions/location";

export default function LocationPromptModal({ show }: { show: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);

  if (!show || dismissed) return null;

  async function handleAllow() {
    setPending(true);
    try {
      if (!navigator.geolocation) {
        await saveUserLocationFromIp();
        return;
      }

      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await saveUserLocationFromCoords(position.coords.latitude, position.coords.longitude);
            resolve();
          },
          async () => {
            await saveUserLocationFromIp();
            resolve();
          },
          { timeout: 10000 }
        );
      });
    } finally {
      setPending(false);
      setDismissed(true);
    }
  }

  async function handleDeny() {
    setPending(true);
    try {
      await saveUserLocationFromIp();
    } finally {
      setPending(false);
      setDismissed(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-black text-[#041B3A]">Share your location?</h2>
        <p className="mt-3 text-neutral-600">Help us serve you better by sharing your location.</p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleAllow}
            disabled={pending}
            className="flex-1 border border-[#07172b] bg-[#07172b] px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {pending ? "Please wait…" : "Yes"}
          </button>
          <button
            type="button"
            onClick={handleDeny}
            disabled={pending}
            className="flex-1 border border-[#d5d7dd] bg-white px-5 py-3 font-bold text-[#07172b] disabled:opacity-60"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
