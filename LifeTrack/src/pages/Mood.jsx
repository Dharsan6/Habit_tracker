import { useState } from "react";
import useMood from "../hooks/useMood";
import MoodPicker from "../components/MoodPicker";
import MoodHistory from "../components/MoodHistory";
import { MOODS } from "../utils/moodStorage";

// Stat card used only on this page
function MoodStat({ emoji, label, count, total }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="text-2xl leading-none">{emoji}</span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{pct}%</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-black dark:text-white">{count}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className="h-full rounded-full bg-black transition-all duration-500 dark:bg-white"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Mood() {
  const { setMood, getMood, getHistory, weeklyStats } = useMood();

  // Which day is selected for editing (null = today)
  const [editingEntry, setEditingEntry] = useState(null);

  const todayMood = getMood();
  const history7 = getHistory(7);
  const history30 = getHistory(30);
  const stats = weeklyStats();

  const editingDate = editingEntry?.date ?? new Date();
  const editingMood = editingEntry
    ? editingEntry.moodValue
    : todayMood;

  const handlePickerSelect = (moodValue) => {
    setMood(moodValue, editingDate);
    setEditingEntry(null);
  };

  const handleDayClick = (entry) => {
    // Clicking today clears the editing state
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (entry.date.getTime() === today.getTime()) {
      setEditingEntry(null);
    } else {
      setEditingEntry(entry);
    }
  };

  const isEditingPast = editingEntry !== null;
  const editLabel = isEditingPast
    ? `How were you feeling on ${new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(editingDate)}?`
    : "How are you feeling today?";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <section className="space-y-2">
        <span className="inline-flex rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black">
          Mood
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          Track how you feel.
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300">
          Log your mood daily and spot patterns over time.
        </p>
      </section>

      {/* ── Today's picker (or past-day editor) ──────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isEditingPast && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-gray-100 px-4 py-2 dark:bg-gray-800">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Editing a past day
            </span>
            <button
              type="button"
              onClick={() => setEditingEntry(null)}
              className="text-xs font-semibold text-black underline dark:text-white"
            >
              Back to today
            </button>
          </div>
        )}
        <MoodPicker
          selected={editingMood}
          onSelect={handlePickerSelect}
          label={editLabel}
        />
      </section>

      {/* ── 7-day history strip ───────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white">Last 7 days</h2>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
              Tap any day to edit its mood.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {stats.logged} / 7 logged
          </span>
        </div>
        <MoodHistory history={history7} onDayClick={handleDayClick} />
      </section>

      {/* ── Weekly stats ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-black dark:text-white">This week</h2>
          {stats.dominant && (
            <span className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {stats.dominant.emoji} Mostly {stats.dominant.label}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {MOODS.map((mood) => (
            <MoodStat
              key={mood.value}
              emoji={mood.emoji}
              label={mood.label}
              count={stats.counts[mood.value]}
              total={stats.logged}
            />
          ))}
        </div>
      </section>

      {/* ── 30-day log ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-black dark:text-white">30-day log</h2>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
            Your full mood history for the past month.
          </p>
        </div>

        {history30.every((e) => e.moodValue === null) ? (
          <div className="flex h-24 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No moods logged yet. Start tracking above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...history30].reverse().map((entry) => {
              if (!entry.moodMeta) return null;
              const dateStr = new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }).format(entry.date);
              return (
                <div
                  key={entry.dateKey}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {dateStr}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{entry.moodMeta.emoji}</span>
                    <span className="text-sm font-semibold text-black dark:text-white">
                      {entry.moodMeta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
