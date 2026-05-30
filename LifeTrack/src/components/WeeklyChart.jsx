import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Custom tooltip shown on hover
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
      <p className="text-xs font-semibold text-black dark:text-white">{d.fullLabel}</p>
      <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
        {d.count} completed · {d.pct}%
      </p>
    </div>
  );
}

/**
 * WeeklyChart
 * Props:
 *   dailyData  — array from useWeeklyAnalytics
 *   isDark     — boolean, drives bar fill color
 */
export default function WeeklyChart({ dailyData, isDark }) {
  const barFill = isDark ? "#ffffff" : "#000000";
  const barFillMuted = isDark ? "#374151" : "#e5e7eb"; // gray-700 / gray-200
  const gridColor = isDark ? "#1f2937" : "#f3f4f6";    // gray-800 / gray-100
  const axisColor = isDark ? "#6b7280" : "#9ca3af";    // gray-500 / gray-400

  // Highest pct day gets full-black/white bar; others get muted
  const maxPct = Math.max(...dailyData.map((d) => d.pct), 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dailyData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={gridColor} strokeDasharray="0" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fontWeight: 600, fill: axisColor, textTransform: "uppercase" }}
        />
        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: axisColor }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
        <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
          {dailyData.map((entry) => (
            <Cell
              key={entry.label}
              fill={entry.pct === maxPct && entry.pct > 0 ? barFill : barFillMuted}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
