import { useMemo, useEffect, useState } from "react";
import { FiActivity, FiAward, FiCheckCircle, FiTarget, FiTrendingUp, FiZap } from "react-icons/fi";
import useHabits from "../hooks/useHabits";
import { getHabitSummary } from "../utils/habitStats";
import { useWeeklyAnalytics } from "../utils/useWeeklyAnalytics";
import { calculateStreak, getCompletionPercentage, getLast7Days, isHabitCompletedOnDate } from "../utils/habitUtils";
import StatCard from "../components/StatCard";
import WeeklyChart from "../components/WeeklyChart";
import WeeklyHeatmap from "../components/WeeklyHeatmap";
import useMood from "../hooks/useMood";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { getBurnoutAnalysis, getRecommendations, getBehavioralPatterns } from "../utils/mlApi";
import { FiCpu, FiAlertTriangle } from "react-icons/fi";

function useIsDark() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

export default function Analytics() {
  const { habits, isLoaded } = useHabits();
  const { moods } = useMood();
  const { user } = useContext(AuthContext);
  const isDark = useIsDark();
  const summary = useMemo(() => getHabitSummary(habits), [habits]);
  const analytics = useWeeklyAnalytics(habits);

  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let isMounted = true;
    
    async function fetchAI() {
      setAiLoading(true);
      try {
        const [recommendations, burnout, patterns] = await Promise.all([
          getRecommendations(user.id, habits, moods),
          getBurnoutAnalysis(user.id, habits, moods),
          getBehavioralPatterns(user.id, habits, moods)
        ]);
        
        if (isMounted && (recommendations || burnout || patterns)) {
          setAiInsights({ recommendations, burnout, patterns });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setAiLoading(false);
      }
    }
    
    fetchAI();
    return () => { isMounted = false };
  }, [isLoaded, user, habits, moods]);

  const last7 = useMemo(() => getLast7Days(), []);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    habits.forEach((h) => {
      const cat = h.category || "General";
      if (!map.has(cat)) map.set(cat, { count: 0, completions: 0 });
      const entry = map.get(cat);
      entry.count++;
      entry.completions += h.completionDates?.length || 0;
    });
    return [...map.entries()].map(([cat, v]) => ({ cat, ...v })).sort((a, b) => b.completions - a.completions);
  }, [habits]);

  // Best / worst day
  const dayAnalysis = useMemo(() => {
    const dayTotals = Array(7).fill(0);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    habits.forEach((h) => {
      (h.completionDates || []).forEach((d) => {
        dayTotals[new Date(d).getDay()]++;
      });
    });
    const max = Math.max(...dayTotals);
    const min = Math.min(...dayTotals.filter((v) => v > 0));
    const bestIdx = dayTotals.indexOf(max);
    const worstIdx = dayTotals.lastIndexOf(min);
    return { dayTotals, dayNames, bestDay: dayNames[bestIdx], worstDay: dayNames[worstIdx] };
  }, [habits]);

  // Streak leaderboard
  const streakLeaderboard = useMemo(() =>
    [...habits]
      .map((h) => ({ name: h.name, streak: calculateStreak(h.completionDates), consistency: getCompletionPercentage(h) }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5),
    [habits]
  );

  if (!isLoaded) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="space-y-2">
        <span className="inline-flex rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black">
          Analytics
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
          Deep-dive into your performance.
        </h1>
        <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
          Understand your patterns, consistency, and where to improve.
        </p>
      </section>

      {/* AI Copilot Insights */}
      {aiInsights && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-900/20">
          <div className="mb-4 flex items-center gap-2">
            <FiCpu className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">LifeTrack AI Copilot</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {aiInsights.burnout && aiInsights.burnout.riskLevel && (
              <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-black dark:text-white">Burnout Risk</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    aiInsights.burnout.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                    aiInsights.burnout.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                  }`}>
                    {aiInsights.burnout.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {aiInsights.burnout.message || "Your current workload and mood trends are stable."}
                </p>
              </div>
            )}

            {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
              <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-900">
                <h3 className="mb-3 font-semibold text-black dark:text-white">Personalized Advice</h3>
                <ul className="space-y-2">
                  {aiInsights.recommendations.slice(0, 2).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="mt-0.5 shrink-0 text-indigo-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* KPI cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total habits" value={summary.totalHabits} hint="Active routines" icon={FiTarget} />
        <StatCard label="7-day rate" value={`${analytics.weeklyPct}%`} hint={`${analytics.totalDone}/${analytics.totalPossible} check-ins`} icon={FiTrendingUp} />
        <StatCard label="Best streak" value={`${summary.bestHabit?.streak ?? 0}d`} hint={summary.bestHabit?.name ?? "—"} icon={FiAward} />
        <StatCard label="Avg consistency" value={`${summary.consistencyLeader?.consistency ?? 0}%`} hint="Across all habits" icon={FiActivity} />
      </section>

      {/* Weekly chart + Heatmap */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-lg font-bold text-black dark:text-white">7-day completion rate</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">% of habits completed per day</p>
          {habits.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Add habits to see the chart</p>
            </div>
          ) : (
            <WeeklyChart dailyData={analytics.dailyData} isDark={isDark} />
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-lg font-bold text-black dark:text-white">Activity heatmap</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Intensity = habits completed that day</p>
          {habits.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Add habits to see the heatmap</p>
            </div>
          ) : (
            <WeeklyHeatmap dailyData={analytics.dailyData} totalHabits={summary.totalHabits} />
          )}
        </div>
      </section>

      {/* Day-of-week breakdown + Streak leaderboard */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Day of week */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-lg font-bold text-black dark:text-white">Day-of-week activity</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Best: <strong>{dayAnalysis.bestDay}</strong> · Least active: <strong>{dayAnalysis.worstDay}</strong>
          </p>
          <div className="space-y-3">
            {dayAnalysis.dayNames.map((day, i) => {
              const max = Math.max(...dayAnalysis.dayTotals, 1);
              const pct = Math.round((dayAnalysis.dayTotals[i] / max) * 100);
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-gray-500 dark:text-gray-400">{day}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800" style={{ height: 10 }}>
                    <div
                      className="h-full rounded-full bg-black dark:bg-white transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs text-gray-500 dark:text-gray-400">{dayAnalysis.dayTotals[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak leaderboard */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-lg font-bold text-black dark:text-white">Streak leaderboard</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Your top 5 habits by current streak</p>
          {streakLeaderboard.length === 0 ? (
            <p className="text-sm text-gray-500">No habits with streaks yet.</p>
          ) : (
            <ol className="space-y-3">
              {streakLeaderboard.map((h, idx) => (
                <li key={h.name} className="flex items-center gap-4">
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    idx === 0 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black dark:text-white">{h.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{h.consistency}% consistent</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-black dark:bg-gray-800 dark:text-white">
                    <FiZap className="h-3 w-3" />
                    {h.streak}d
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-lg font-bold text-black dark:text-white">Category breakdown</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Habits and total completions per category</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categoryBreakdown.map((c) => (
              <div key={c.cat} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                <div>
                  <p className="text-sm font-semibold text-black dark:text-white">{c.cat}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.count} habit{c.count !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-black dark:text-white">{c.completions}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">completions</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
