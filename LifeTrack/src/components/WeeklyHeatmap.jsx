import { useState } from "react";

/**
 * Maps a completion percentage (0–100) to an opacity level.
 * Returns a Tailwind opacity class and a descriptive label.
 */
function getIntensity(pct) {
  if (pct === 0)  return { opacity: "opacity-0",    label: "None"      };
  if (pct <= 25)  return { opacity: "opacity-20",   label: "Low"       };
  if (pct <= 50)  return { opacity: "opacity-40",   label: "Moderate"  };
  if (pct <= 75)  return { opacity: "opacity-65",   label: "Good"      };
  if (pct < 100)  return { opacity: "opacity-85",   label: "High"      };
  return           { opacity: "opacity-100",  label: "Perfect"   };
}

/** Tooltip shown on hover over a cell */
function Tooltip({ day }) {
  const intensity = getIntensity(day.pct);
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-semibold text-black dark:text-white">{day.fullLabel}</p>
      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
        {day.count} completed · {day.pct}%
      </p>
      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
        Intensity: {intensity.label}
      </p>
      {/* Arrow */}
      <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-200 dark:border-t-gray-700" />
    </div>
  );
}

/**
 * WeeklyHeatmap
 *
 * Props:
 *   dailyData — array[7] from useWeeklyAnalytics:
 *               { date, label, fullLabel, count, pct }
 *   totalHabits — number, used to show "x / total" in legend
 */
export default function WeeklyHeatmap({ dailyData, totalHabits }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-3">
      {/* ── Cells ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-2">
        {dailyData.map((day, i) => {
          const { opacity } = getIntensity(day.pct);
          const isToday = day.date.getTime() === today.getTime();
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={day.label}
              className="relative flex flex-col items-center gap-2"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && <Tooltip day={day} />}

              {/* Heatmap cell */}
              <div
                className={[
                  "relative h-10 w-full cursor-default rounded-xl transition-transform duration-150",
                  // Base fill: black in light mode, white in dark mode
                  "bg-black dark:bg-white",
                  // Intensity via opacity
                  opacity,
                  // Today gets a ring
                  isToday
                    ? "ring-2 ring-black ring-offset-2 dark:ring-white dark:ring-offset-gray-900"
                    : "",
                  // Hover: slight scale
                  isHovered ? "scale-105" : "",
                  // Zero days: show a faint border so the cell is still visible
                  day.pct === 0
                    ? "border border-gray-200 bg-transparent opacity-100 dark:border-gray-700"
                    : "",
                ].join(" ")}
              />

              {/* Count label */}
              <span className="text-xs font-semibold tabular-nums text-black dark:text-white">
                {day.count > 0 ? day.count : "—"}
              </span>

              {/* Day label */}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Legend ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
        <div className="flex items-center gap-1.5">
          {[0, 20, 40, 65, 85, 100].map((op) => (
            <div
              key={op}
              style={{ opacity: op / 100 }}
              className={[
                "h-3 w-5 rounded-sm bg-black dark:bg-white",
                op === 0 ? "border border-gray-200 dark:border-gray-700" : "",
              ].join(" ")}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
      </div>

      {/* ── Footer note ───────────────────────────────────────────── */}
      {totalHabits > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Each cell = completions out of {totalHabits} habit{totalHabits !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
