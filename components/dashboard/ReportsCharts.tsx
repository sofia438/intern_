"use client";

import { useState } from "react";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";



export function LineTrendChart({
  data,
  color = "#4338ca",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const { dictionary: t } = useLanguage();
  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const [hover, setHover] = useState<number | null>(null);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((d) => d.value));

  const points = data.map((d, i) => {
    const x = padding.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = padding.top + innerH - (d.value / max) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1]?.x ?? 0},${padding.top + innerH} L${points[0]?.x ?? 0},${padding.top + innerH} Z`;

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
        {t.reportsCharts.noDataForPeriod}
      </div>
    );
  }

  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + innerH * (1 - f)}
            y2={padding.top + innerH * (1 - f)}
            className="stroke-[#ececec] dark:stroke-[#3a3a3a]"
            strokeWidth={1}
          />
        ))}
        <path d={areaPath} fill={color} opacity={0.12} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} />
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 3}
              fill={color}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
            {i % labelStep === 0 && (
              <text x={p.x} y={height - 8} textAnchor="middle" className="fill-neutral-500 text-[10px] dark:fill-neutral-400">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded bg-[#07172b] px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(points[hover].x / width) * 100}%`, top: `${(points[hover].y / height) * 100}%` }}
        >
          <strong className="block">{points[hover].label}</strong>
          <span>{points[hover].value.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

export function BarRows({
  data,
  color = "#4338ca",
  formatValue,
}: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const { dictionary: t } = useLanguage();
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.reportsCharts.noDataForPeriod}</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-bold dark:text-neutral-100">{d.label}</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#ecebea] dark:bg-[#3a3a3a]">
            <div
              className="h-2 rounded-full"
              style={{ width: `${Math.max(2, (d.value / max) * 100)}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GroupedBarChart({
  data,
  series,
}: {
  data: { label: string; values: Record<string, number> }[];
  series: { key: string; color: string; name: string }[];
}) {
  const { dictionary: t } = useLanguage();
  if (data.length === 0) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.reportsCharts.noDataForPeriod}</p>;
  }

  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0)));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="h-2.5 w-6 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div className="space-y-5">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1.5 text-sm font-bold dark:text-neutral-100">{d.label}</div>
            <div className="flex gap-2">
              {series.map((s) => {
                const value = d.values[s.key] ?? 0;
                return (
                  <div key={s.key} className="flex-1">
                    <div className="h-2 rounded-full bg-[#ecebea] dark:bg-[#3a3a3a]">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.max(2, (value / max) * 100)}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">{value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function usageState(percentage: number, t: Dictionary): { label: string; color: string } {
  if (percentage >= 100) return { label: t.reportsCharts.limitReached, color: "#dc2626" };
  if (percentage >= 90) return { label: t.reportsCharts.critical, color: "#dc2626" };
  if (percentage >= 70) return { label: t.reportsCharts.warning, color: "#d97706" };
  return { label: t.reportsCharts.normal, color: "#16a34a" };
}

export function CircularUsageChart({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const { dictionary: t } = useLanguage();
  const size = 160;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const dash = (percentage / 100) * c;
  const state = usageState(percentage, t);

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-[#ecebea] dark:stroke-[#3a3a3a]" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ stroke: state.color, transition: "stroke-dasharray 0.3s" }}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" dominantBaseline="central" className="fill-black text-2xl font-black dark:fill-white">
          {limit > 0 ? `${Math.round(percentage)}%` : "—"}
        </text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" dominantBaseline="central" className="fill-neutral-500 text-[10px] dark:fill-neutral-400">
          {limit > 0 ? `${used.toLocaleString()} / ${limit.toLocaleString()}` : t.reportsCharts.notIncluded}
        </text>
      </svg>
      <div>
        <strong className="block dark:text-white">{label}</strong>
        {limit > 0 && (
          <span className="font-mono text-xs uppercase tracking-wide" style={{ color: state.color }}>
            {state.label}
          </span>
        )}
      </div>
    </div>
  );
}

export function KpiDelta({ deltaPct }: { deltaPct: number | null }) {
  const { dictionary: t } = useLanguage();
  if (deltaPct === null) return <small className="text-neutral-400 dark:text-neutral-500">{t.common.noPriorPeriod}</small>;
  const positive = deltaPct >= 0;
  return (
    <small className={positive ? "text-[#5b6300] dark:text-[#c7d400]" : "text-red-600 dark:text-red-400"}>
      {positive ? "+" : ""}
      {deltaPct.toFixed(1)}% {t.common.vsPriorPeriod}
    </small>
  );
}
