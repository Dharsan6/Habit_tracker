import React from "react";

export default function StreakBadge({ streak, className = "" }) {
  if (streak <= 0) return null;

  let style = "border border-amber-200/70 bg-amber-50 text-amber-700";
  let icon = "⚡";

  if (streak >= 7) {
    style = "border-transparent bg-gradient-to-r from-orange-500 to-rose-500 font-bold text-white shadow-sm";
    icon = "🚀";
  } else if (streak >= 3) {
    style = "border border-orange-200 bg-orange-100 font-bold text-orange-700 shadow-sm";
    icon = "🔥";
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${style} ${className}`}
    >
      <span>{icon}</span>
      <span>
        {streak} {streak === 1 ? "Day" : "Days"}
      </span>
    </div>
  );
}
