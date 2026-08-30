"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import type { CityStat, CountryStat, GeoDistribution, GeoRange } from "@/lib/visitorIntelligenceShared";
import { GEO_RANGE_OPTIONS } from "@/lib/visitorIntelligenceShared";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const GEO_URL = "/geo/countries-110m.json";
const REFRESH_INTERVAL_MS = 45_000;

function colorForRatio(ratio: number): string {
  
  const clamped = Math.max(0, Math.min(1, ratio));
  const from = { r: 0xe6, g: 0xe4, b: 0xf7 };
  const to = { r: 0x43, g: 0x38, b: 0xca };
  const r = Math.round(from.r + (to.r - from.r) * clamped);
  const g = Math.round(from.g + (to.g - from.g) * clamped);
  const b = Math.round(from.b + (to.b - from.b) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

type HoverInfo = { name: string; count: number; percentage: number } | null;

export default function GeographicDistribution({ initialData }: { initialData: GeoDistribution }) {
  const { dictionary: t } = useLanguage();
  const [range, setRange] = useState<GeoRange>("30d");
  const [tab, setTab] = useState<"countries" | "cities">("countries");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [data, setData] = useState<GeoDistribution>(initialData);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState<HoverInfo>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ range });
        if (selectedCountry) params.set("country", selectedCountry);
        const response = await fetch(`/api/visitor-intelligence/geo?${params.toString()}`);
        if (!response.ok) return;
        const json = await response.json();
        if (!cancelled) setData(json);
      } catch {
        // keep showing the last known data on a transient failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [range, selectedCountry]);

  const countryStatsByMapName = useMemo(() => {
    const map = new Map<string, CountryStat>();
    for (const c of data.countries) {
      if (c.mapName) map.set(c.mapName, c);
    }
    return map;
  }, [data.countries]);

  const maxCountryCount = useMemo(
    () => Math.max(1, ...data.countries.filter((c) => c.mapName).map((c) => c.count)),
    [data.countries]
  );

  const rows: (CountryStat | CityStat)[] = tab === "countries" ? data.countries : data.cities;
  const maxRowCount = Math.max(1, ...rows.map((r) => r.count));

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function selectCountryDrillDown(country: string) {
    if (country === "Other") return;
    setSelectedCountry((prev) => (prev === country ? null : country));
    setTab("cities");
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black dark:text-white">{t.geoDistribution.title}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t.geoDistribution.visitorsAcrossCountries
              .replace("{count}", data.total.toLocaleString())
              .replace(
                "{countries}",
                `${data.countries.filter((c) => c.country !== "Other").length}${data.countries.some((c) => c.country === "Other") ? "+" : ""}`
              )}
            {loading && <span className="ml-2 text-neutral-400">{t.geoDistribution.refreshing}</span>}
          </p>
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#d5d7dd] bg-[#f4f2f2] p-1 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
          {GEO_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRange(option.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                range === option.value
                  ? "bg-white text-black shadow-sm dark:bg-[#242424] dark:text-white"
                  : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {t.geoDistribution.range[option.value]}
            </button>
          ))}
        </div>
      </div>

      {data.total === 0 ? (
        <div className="rounded border border-dashed border-[#dfe2e7] p-10 text-center dark:border-[#3a3a3a]">
          <p className="font-bold dark:text-white">{t.geoDistribution.emptyTitle}</p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t.geoDistribution.emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded border border-[#dfe2e7] bg-[#fafaf9] dark:border-[#3a3a3a] dark:bg-[#1f1f1f]"
            onMouseMove={handleMouseMove}
          >
            <ComposableMap projectionConfig={{ scale: 135 }} style={{ width: "100%", height: "auto" }}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const name: string = geo.properties.name;
                    const stat = countryStatsByMapName.get(name);
                    const fill = stat ? colorForRatio(stat.count / maxCountryCount) : "#e5e5e5";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        onMouseEnter={() =>
                          setHover({ name, count: stat?.count ?? 0, percentage: stat?.percentage ?? 0 })
                        }
                        onMouseLeave={() => setHover(null)}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: stat ? "#312e81" : "#d4d4d4", cursor: stat ? "pointer" : "default" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {hover && (
              <div
                className="pointer-events-none absolute z-10 rounded bg-[#07172b] px-3 py-2 text-xs text-white shadow-lg"
                style={{ left: mousePos.x + 12, top: mousePos.y + 12 }}
              >
                <strong className="block">{hover.name}</strong>
                {hover.count > 0 ? (
                  <>
                    <span className="block">{t.geoDistribution.visitorsTooltip.replace("{count}", String(hover.count))}</span>
                    <span className="block">{t.geoDistribution.shareTooltip.replace("{percentage}", hover.percentage.toFixed(1))}</span>
                  </>
                ) : (
                  <span className="block text-neutral-300">{t.geoDistribution.noVisitsTooltip}</span>
                )}
              </div>
            )}

            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span>{t.geoDistribution.fewerVisitors}</span>
              <span
                className="h-2 w-16 rounded-full"
                style={{ background: `linear-gradient(to right, ${colorForRatio(0)}, ${colorForRatio(1)})` }}
              />
              <span>{t.geoDistribution.moreVisitors}</span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex rounded-full border border-[#d5d7dd] bg-[#f4f2f2] p-1 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
                <button
                  type="button"
                  onClick={() => {
                    setTab("countries");
                    setSelectedCountry(null);
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    tab === "countries"
                      ? "bg-white text-black shadow-sm dark:bg-[#242424] dark:text-white"
                      : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {t.geoDistribution.countriesTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("cities")}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    tab === "cities"
                      ? "bg-white text-black shadow-sm dark:bg-[#242424] dark:text-white"
                      : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {t.geoDistribution.citiesTab}
                </button>
              </div>
              {tab === "cities" && selectedCountry && (
                <button
                  type="button"
                  onClick={() => setSelectedCountry(null)}
                  className="text-xs font-bold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                >
                  {selectedCountry} ✕
                </button>
              )}
            </div>

            <div className="space-y-3">
              {rows.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.geoDistribution.noDataForView}</p>
              ) : (
                rows.map((row) => {
                  const label = "country" in row && tab === "countries" ? row.country : "city" in row ? row.city : "";
                  const key = tab === "countries" ? (row as CountryStat).country : `${(row as CityStat).city}-${(row as CityStat).country}`;
                  const clickable = tab === "countries" && label !== "Other";
                  const Tag = clickable ? "button" : "div";
                  return (
                    <Tag
                      key={key}
                      type={clickable ? "button" : undefined}
                      onClick={clickable ? () => selectCountryDrillDown(label) : undefined}
                      className={`w-full rounded p-2 text-left ${clickable ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]" : ""}`}
                    >
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-bold dark:text-neutral-100">{label}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {row.count.toLocaleString()} · {row.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#ecebea] dark:bg-[#3a3a3a]">
                        <div
                          className="h-2 rounded-full bg-[#4338ca]"
                          style={{ width: `${Math.max(2, (row.count / maxRowCount) * 100)}%` }}
                        />
                      </div>
                    </Tag>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
