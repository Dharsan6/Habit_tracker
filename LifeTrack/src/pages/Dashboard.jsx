import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import useHabits from "../hooks/useHabits";
import { getHabitSummary } from "../utils/habitStats";
import { useWeeklyAnalytics } from "../utils/useWeeklyAnalytics";
import { calculateStreak, getCompletionPercentage, isHabitCompletedOnDate } from "../utils/habitUtils";
import StreakBadge from "../components/StreakBadge";
import StatCard from "../components/StatCard";
import WeeklyChart from "../components/WeeklyChart";
import WeeklyHeatmap from "../components/WeeklyHeatmap";
import AnalyticsInsightCards from "../components/AnalyticsInsightCards";

// Detect dark mode from the <html> class set by useTheme
function useIsDark() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export default function Dashboard() {
  const { habits, isLoaded, toggleHabit } = useHabits();
  const isDark = useIsDark();

  const summary = useMemo(() => getHabitSummary(habits), [habits]);
  const analytics = useWeeklyAnalytics(habits);

  const topHabits = useMemo(
    () =>
      [...habits]
        .sort((a, b) => {
          const diff = calculateStreak(b.completionDates) - calculateStreak(a.completionDates);
          if (diff !== 0) return diff;
          return getCompletionPercentage(b) - getCompletionPercentage(a);
        })
        .slice(0, 4),
    [habits],
  );

  if (!isLoaded) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl bg-black px-6 py-8 text-white dark:bg-white dark:text-black sm:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] dark:bg-black/10">
              Dashboard
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              A clear view of your routine momentum.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-gray-300 dark:text-gray-700 sm:text-base">
              Review daily completion, weekly consistency, and the habit currently carrying your best streak.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold dark:bg-black/10">
                {summary.completedToday}/{summary.totalHabits} done today
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold dark:bg-black/10">
                {analytics.weeklyPct}% this week
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black dark:text-white">Quick checklist</h3>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
            {habits.slice(0, 5).map(habit => {
              const isDone = isHabitCompletedOnDate(habit, new Date());
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                >
                  <div className={`grid h-6 w-6 place-items-center rounded-lg border-2 transition-colors ${isDone ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' : 'border-gray-300 dark:border-gray-700'}`}>
                    {isDone && <FiCheckCircle className="h-4 w-4" />}
                  </div>
                  <span className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-black dark:text-white'}`}>{habit.name}</span>
                </button>
              );
            })}
            {habits.length === 0 && <p className="text-xs text-gray-500 text-center py-4">No habits set for today.</p>}
          </div>
          <Link to="/habits" className="mt-4 block text-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition">Manage habits</Link>
        </div>
      </section>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's completion"
          value={`${summary.completionPercentage}%`}
          hint={`${summary.completedToday} of ${summary.totalHabits} habits done`}
          icon={FiCheckCircle}
        />
        <StatCard
          label="7-day completion"
          value={`${analytics.weeklyPct}%`}
          hint={`${analytics.totalDone} of ${analytics.totalPossible} possible check-ins`}
          icon={FiTrendingUp}
        />
        <StatCard
          label="Best streak"
          value={`${summary.bestHabit?.streak ?? 0}d`}
          hint={summary.bestHabit?.name ?? "No active streak yet"}
          icon={FiAward}
        />
        <StatCard
          label="Consistency leader"
          value={`${summary.consistencyLeader?.consistency ?? 0}%`}
          hint={summary.consistencyLeader?.name ?? "No habits tracked yet"}
          icon={FiTarget}
        />
      </section>

      {/* ── Weekly Analytics: Chart + Heatmap ────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-2">

        {/* Bar chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
                Weekly analytics
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Completion % per day — last 7 days.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {analytics.totalDone} check-ins
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  analytics.trendDelta > 5
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : analytics.trendDelta < -5
                    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {analytics.trendDelta > 0 ? "+" : ""}{analytics.trendDelta}% vs last week
              </span>
            </div>
          </div>
          {habits.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Add habits to see your weekly chart.</p>
            </div>
          ) : (
            <WeeklyChart dailyData={analytics.dailyData} isDark={isDark} />
          )}
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
              Activity heatmap
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Color intensity shows how many habits you completed each day.
            </p>
          </div>
          {habits.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Add habits to see your heatmap.</p>
            </div>
          ) : (
            <WeeklyHeatmap
              dailyData={analytics.dailyData}
              totalHabits={summary.totalHabits}
            />
          )}
        </div>
      </section>

      {/* ── Insight Cards ────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">Insights</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Best day · Least active · Most consistent · Trend · Drop patterns
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            Last 7 days
          </span>
        </div>
        <AnalyticsInsightCards insights={analytics.insights} />
      </section>

      {/* ── Top habits ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">Top habits</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Your strongest performers right now.</p>
          </div>
          <Link
            to="/habits"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
          >
            Manage <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {topHabits.length === 0 ? (
          <div className="rounded-2xl bg-gray-100 p-6 text-center dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No habits yet. Add one to populate this view.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {topHabits.map((habit) => {
              const streak = calculateStreak(habit.completionDates);
              const consistency = getCompletionPercentage(habit);
              const completedToday = isHabitCompletedOnDate(habit, new Date());
              return (
                <div
                  key={habit.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-9 w-9 place-items-center rounded-xl ${
                            completedToday
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-black dark:text-white">{habit.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {completedToday ? "Done today" : "Pending today"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StreakBadge streak={streak} />
                        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          {consistency}% consistent
                        </span>
                      </div>
                    </div>
                    <div className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      <FiClock className="mr-1 inline h-3 w-3" />
                      Active
                    </div>
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
