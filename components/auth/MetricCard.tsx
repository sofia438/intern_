import { ReactNode } from "react";

type MetricCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
};

export default function MetricCard({
  icon,
  title,
  value,
}: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md shadow-lg">
      <div className="rounded-lg bg-yellow-400 p-2 text-black">
        {icon}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-300">
          {title}
        </p>

        <h3 className="font-semibold text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}