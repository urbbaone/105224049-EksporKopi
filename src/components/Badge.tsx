import React from "react";

type BadgeVariant = "verified" | "pending" | "rejected" | "grade1" | "grade2" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  verified: "bg-green-100 text-green-800 border border-green-200",
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
  grade1: "bg-[#2c1810] text-amber-200",
  grade2: "bg-[#4a2c20] text-amber-300",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

const dotStyles: Record<BadgeVariant, string> = {
  verified: "bg-green-500",
  pending: "bg-amber-500",
  rejected: "bg-red-500",
  grade1: "bg-amber-400",
  grade2: "bg-amber-600",
  default: "bg-gray-400",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotStyles[variant]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
