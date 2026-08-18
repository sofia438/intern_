import Image from "next/image";
import {
  Database,
  Globe2,
  BarChart3,
} from "lucide-react";

import MetricCard from "@/components/auth/MetricCard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-[#041B3A]">
      {/* ================= LEFT PANEL ================= */}

      <section className="flex w-[420px] flex-col justify-between bg-white px-10 py-8 shadow-2xl">
        <div>
          {/* Logo + Title */}

          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="GlobalExpo AI Logo"
              width={80}
              height={80}
              priority
              className="object-contain"
            />

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#041B3A]">
                GlobalExpo
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Discover Your Next Global Market with AI.
              </p>
            </div>
          </div>

          {/* Form */}

          <div className="mt-12">{children}</div>
        </div>

        {/* Footer */}

        <footer className="border-t pt-5 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>© 2024 GlobalExpo </span>

            <div className="flex gap-4">
              <a href="#" className="hover:text-[#041B3A]">
                Privacy
              </a>

              <a href="#" className="hover:text-[#041B3A]">
                Terms
              </a>

              <a href="#" className="hover:text-[#041B3A]">
                Support
              </a>
            </div>
          </div>
        </footer>
      </section>

      {/* ================= RIGHT PANEL ================= */}

      <section className="relative flex-1 overflow-hidden bg-[#041B3A]">
        {/* Background */}

        <Image
          src="/images/world-map.jpeg"
          alt="World Map"
          fill
          priority
          className="object-cover opacity-35"
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-br from-[#041B3A]/70 via-[#041B3A]/20 to-[#041B3A]/80" />

        {/* Floating Cards */}

        <div className="absolute left-16 top-20">
          <MetricCard
            icon={<Database size={18} />}
            title="TOTAL COVERAGE"
            value="14.2M Leads"
          />
        </div>

        <div className="absolute right-20 bottom-48">
          <MetricCard
            icon={<BarChart3 size={18} />}
            title="DATA PRECISION"
            value="98.2% Accuracy"
          />
        </div>

        <div className="absolute bottom-24 left-28">
          <MetricCard
            icon={<Globe2 size={18} />}
            title="GLOBAL REACH"
            value="210+ Countries"
          />
        </div>

        {/* Center Content */}

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
              The Future of Export Sales
            </span>
          </div>

          <h2 className="mt-8 text-center text-6xl font-bold leading-tight text-white">
            Scale Beyond
            <br />
            Borders
          </h2>

          <p className="mt-6 max-w-xl text-center text-lg leading-8 text-slate-300">
            AI-powered export intelligence that helps manufacturers,
            exporters, and suppliers discover verified buyers across
            more than 210 countries.
          </p>
        </div>
      </section>
    </main>
  );
}
