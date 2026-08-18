"use client";

import { useState } from "react";

export default function CopySnippetButton({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 border border-[#07172b] bg-[#07172b] px-5 py-3 font-bold text-white"
    >
      {copied ? "Copied!" : "Copy Snippet"}
    </button>
  );
}
