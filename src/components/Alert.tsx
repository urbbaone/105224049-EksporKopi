"use client";
import React, { useState } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title: string;
  message: string;
  dismissible?: boolean;
}

const alertConfig: Record<AlertType, { bg: string; border: string; icon: string; titleColor: string; msgColor: string }> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "✅",
    titleColor: "text-green-800",
    msgColor: "text-green-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "❌",
    titleColor: "text-red-800",
    msgColor: "text-red-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "⚠️",
    titleColor: "text-amber-800",
    msgColor: "text-amber-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "ℹ️",
    titleColor: "text-blue-800",
    msgColor: "text-blue-700",
  },
};

export default function Alert({ type, title, message, dismissible = false }: AlertProps) {
  const [visible, setVisible] = useState(true);
  const config = alertConfig[type];

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border p-4 ${config.bg} ${config.border}`}
    >
      <span className="text-xl flex-shrink-0" aria-hidden="true">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.titleColor}`}>{title}</p>
        <p className={`mt-0.5 text-sm ${config.msgColor}`}>{message}</p>
      </div>
      {dismissible && (
        <button
          aria-label="Dismiss alert"
          onClick={() => setVisible(false)}
          className={`flex-shrink-0 rounded p-0.5 transition-colors hover:bg-black/10 ${config.titleColor}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      )}
    </div>
  );
}
