/**
 * MoodHistory
 * Props:
 *   history — array from useMood().getHistory(7)
 *   onDayClick — optional (entry) => void to edit a past day
 */
export default function MoodHistory({ history, onDayClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-7 gap-2">
      {history.map((entry) => {
        const isToday = entry.date.getTime() === today.getTime();
        const dayLabel = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(entry.date);
        const dateNum = entry.date.getDate();
        const hasLog = entry.moodMeta !== null;

        return (
          <button
            key={entry.dateKey}
            type="button"
            onClick={() => onDayClick?.(entry)}
            className={[
              "group flex flex-col items-center gap-1.5 rounded-2xl border-2 px-1 py-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 dark:focus:ring-white",
              isToday
                ? "border-black dark:border-white"
                : "border-gray-200 dark:border-gray-800",
              hasLog
                ? "bg-gray-50 dark:bg-gray-800"
                : "bg-white dark:bg-gray-900",
              onDayClick
                ? "cursor-pointer hover:border-gray-400 dark:hover:border-gray-600"
                : "cursor-default",
            ].join(" ")}
            aria-label={`${dayLabel} ${dateNum}: ${entry.moodMeta?.label ?? "No mood logged"}`}
          >
            {/* Emoji or empty dot */}
            <span className="text-xl leading-none">
              {hasLog ? entry.moodMeta.emoji : (
                <span className="block h-5 w-5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600" />
              )}
            </span>

            {/* Day name */}
            <span className={[
              "text-[10px] font-bold uppercase tracking-wider",
              isToday ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400",
            ].join(" ")}>
              {dayLabel}
            </span>

            {/* Date number */}
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              {dateNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
