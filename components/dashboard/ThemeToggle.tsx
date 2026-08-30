"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function select(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  
  if (!theme) {
    return <div className="h-9 w-[68px]" aria-hidden />;
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[#d5d7dd] bg-[#f4f2f2] p-1 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
      <button
        type="button"
        onClick={() => select("light")}
        aria-label="Light theme"
        aria-pressed={theme === "light"}
        className={`grid h-7 w-7 place-items-center rounded-full transition ${
          theme === "light" ? "bg-[#e7f600] text-black" : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        <Sun size={16} />
      </button>
      <button
        type="button"
        onClick={() => select("dark")}
        aria-label="Dark theme"
        aria-pressed={theme === "dark"}
        className={`grid h-7 w-7 place-items-center rounded-full transition ${
          theme === "dark" ? "bg-[#07172b] text-white" : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
