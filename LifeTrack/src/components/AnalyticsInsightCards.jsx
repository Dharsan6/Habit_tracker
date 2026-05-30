// Severity → border accent + badge style
const severityStyles = {
  positive: {
    border: "border-gray-200 dark:border-gray-800",
    badge: "bg-black text-white dark:bg-white dark:text-black",
    badgeLabel: "Good",
  },
  warning: {
    border: "border-gray-300 dark:border-gray-700",
    badge: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    badgeLabel: "Attention",
  },
  neutral: {
    border: "border-gray-200 dark:border-gray-800",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    badgeLabel: "Info",
  },
};

export default function AnalyticsInsightCards({ insights }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {insights.map((insight) => {
        const style = severityStyles[insight.severity] ?? severityStyles.neutral;
        return (
          <div
            key={insight.id}
            className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 dark:bg-gray-900 ${style.border}`}
          >
            {/* Header row: icon + severity badge */}
            <div className="flex items-center justify-between">
              <span className="text-2xl leading-none">{insight.icon}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.badge}`}>
                {style.badgeLabel}
              </span>
            </div>

            {/* Title */}
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {insight.title}
            </p>

            {/* Value */}
            <p className="text-base font-bold leading-snug text-black dark:text-white">
              {insight.value}
            </p>

            {/* Detail */}
            <p className="mt-auto text-sm leading-5 text-gray-600 dark:text-gray-300">
              {insight.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
}
