import { MOODS } from "../utils/moodStorage";

/**
 * MoodPicker
 * Props:
 *   selected  — current mood value ("happy" | "neutral" | "sad" | null)
 *   onSelect  — (moodValue) => void
 *   label     — optional heading string
 */
export default function MoodPicker({ selected, onSelect, label = "How are you feeling today?" }) {
  return (
    <div className="space-y-4">
      {label && (
        <p className="text-sm font-semibold text-black dark:text-white">{label}</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {MOODS.map((mood) => {
          const isSelected = selected === mood.value;
          return (
            <button
              key={mood.value}
              type="button"
              onClick={() => onSelect(mood.value)}
              className={[
                "flex flex-col items-center gap-2 rounded-2xl border-2 px-4 py-5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:focus:ring-white dark:focus:ring-offset-gray-900",
                isSelected
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-gray-200 bg-white text-black hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:border-gray-500 dark:hover:bg-gray-800",
              ].join(" ")}
              aria-pressed={isSelected}
              aria-label={mood.label}
            >
              <span className="text-3xl leading-none">{mood.emoji}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Tap again to remove today's mood
        </p>
      )}
    </div>
  );
}
