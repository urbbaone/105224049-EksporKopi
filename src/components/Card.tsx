import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export default function Card({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
        rounded-2xl border border-[#e8ddd0] bg-white shadow-sm
        ${hover ? "transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5 cursor-pointer" : ""}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Sub-component for stat cards
interface StatCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

export function StatCard({ label, value, change, positive, icon }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#9a7e6d] font-medium">{label}</p>
          <p className="mt-1 text-3xl font-extrabold text-[#2c1810]">{value}</p>
          <p className={`mt-1 text-xs font-medium ${positive ? "text-green-600" : "text-amber-600"}`}>
            {change}
          </p>
        </div>
        <span className="text-3xl" aria-hidden="true">{icon}</span>
      </div>
    </Card>
  );
}
