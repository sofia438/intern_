"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Mail, Search, UserRound } from "lucide-react";

import type { NotificationItem, NotificationType } from "@/lib/notificationsShared";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const LAST_SEEN_KEY = "ge_notifications_last_seen";
const POLL_MS = 60000;

const ICONS: Record<NotificationType, typeof Bell> = {
  search: Search,
  campaign: Mail,
  lead: UserRound,
};

function timeAgo(iso: string, t: Dictionary): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t.notificationBell.justNow;
  if (minutes < 60) return t.notificationBell.minutesAgo.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.notificationBell.hoursAgo.replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  if (days < 30) return t.notificationBell.daysAgo.replace("{n}", String(days));
  return new Date(iso).toLocaleDateString();
}

export default function NotificationBell() {
  const { dictionary: t } = useLanguage();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LAST_SEEN_KEY);
    setLastSeen(stored ? Number(stored) : 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/notifications");
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data.items)) setItems(data.items);
      } catch {
        
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = items.filter((item) => new Date(item.timestamp).getTime() > lastSeen).length;

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        const now = Date.now();
        window.localStorage.setItem(LAST_SEEN_KEY, String(now));
        setLastSeen(now);
      }
      return next;
    });
  }

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="relative text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
        aria-label={t.notificationBell.ariaLabel}
      >
        <Bell size={23} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-3 w-80 rounded-md border border-[#dfe2e7] bg-white shadow-lg dark:border-[#3a3a3a] dark:bg-[#242424]">
          <div className="border-b border-[#ececec] px-4 py-3 font-bold dark:border-[#3a3a3a] dark:text-white">
            {t.notificationBell.heading}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {t.notificationBell.empty}
              </p>
            ) : (
              items.map((item) => {
                const Icon = ICONS[item.type];
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 border-b border-[#f2f2f2] px-4 py-3 last:border-0 hover:bg-neutral-50 dark:border-[#333] dark:hover:bg-[#2e2e2e]"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f2f1ef] dark:bg-[#3a3a3a]">
                      <Icon size={16} className="text-neutral-600 dark:text-neutral-300" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold dark:text-white">{item.title}</span>
                      <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {item.description}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-400 dark:text-neutral-500">
                        {timeAgo(item.timestamp, t)}
                      </span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
