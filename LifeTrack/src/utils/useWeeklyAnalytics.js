import { useMemo } from "react";
import { getLast7Days, isHabitCompletedOnDate, getCompletionPercentage } from "./habitUtils";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns the N days before the last-7-day window (days 8–14 ago). */
function getPrev7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 8 - i); // 8..14 days ago
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

/**
 * Detects a drop pattern for a single habit.
 * A "drop" = completed ≥4 of the previous 7 days but ≤1 of the last 3 days.
 */
function detectDrop(habit, last7Days) {
  const last3 = last7Days.slice(-3);
  const first4 = last7Days.slice(0, 4);
  const recentCount = last3.filter((d) => isHabitCompletedOnDate(habit, d)).length;
  const priorCount = first4.filter((d) => isHabitCompletedOnDate(habit, d)).length;
  return priorCount >= 3 && recentCount <= 1;
}

// ─── main hook ───────────────────────────────────────────────────────────────

export function useWeeklyAnalytics(habits) {
  return useMemo(() => {
    const days = getLast7Days();
    const totalHabits = habits.length;

    // ── Per-day completion data ──────────────────────────────────────────────
    const dailyData = days.map((date) => {
      const count = habits.filter((h) => isHabitCompletedOnDate(h, date)).length;
      const pct = totalHabits === 0 ? 0 : Math.round((count / totalHabits) * 100);
      return {
        date,
        label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
        fullLabel: new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        }).format(date),
        count,
        pct,
      };
    });

    // ── 7-day totals ─────────────────────────────────────────────────────────
    const totalPossible = totalHabits * 7;
    const totalDone = dailyData.reduce((s, d) => s + d.count, 0);
    const weeklyPct = totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100);

    // ── Trend vs previous 7 days ─────────────────────────────────────────────
    const prev7Days = getPrev7Days();
    const prevDone = habits.reduce(
      (s, h) => s + prev7Days.filter((d) => isHabitCompletedOnDate(h, d)).length,
      0,
    );
    const prevPct = totalPossible === 0 ? 0 : Math.round((prevDone / totalPossible) * 100);
    const trendDelta = weeklyPct - prevPct;

    // ── Best / worst day ─────────────────────────────────────────────────────
    const activeDays = totalHabits > 0 ? dailyData : [];
    const bestDay = activeDays.length
      ? activeDays.reduce((a, b) => (b.pct >= a.pct ? b : a))
      : null;
    const worstDay = activeDays.length
      ? activeDays.reduce((a, b) => (b.pct <= a.pct ? b : a))
      : null;

    // ── Most consistent habit (highest all-time completion %) ────────────────
    const mostConsistent =
      habits.length > 0
        ? habits.reduce((best, h) => {
            const pct = getCompletionPercentage(h);
            return pct > (best?.pct ?? -1) ? { name: h.name, pct } : best;
          }, null)
        : null;

    // ── Drop pattern detection ───────────────────────────────────────────────
    // Find habits that were active earlier in the week but went quiet recently.
    const droppingHabits = habits.filter((h) => detectDrop(h, days));

    // ── Build insight objects ────────────────────────────────────────────────
    // severity: "positive" | "warning" | "neutral"

    const trendInsight = (() => {
      if (totalHabits === 0)
        return {
          id: "trend",
          title: "Consistency trend",
          value: "No data yet",
          detail: "Add habits to start tracking your consistency trend.",
          icon: "📊",
          severity: "neutral",
        };
      if (trendDelta > 5)
        return {
          id: "trend",
          title: "Consistency trend",
          value: `↑ Up ${trendDelta}%`,
          detail: `Completion improved by ${trendDelta}% vs the previous 7 days. Keep it up.`,
          icon: "🚀",
          severity: "positive",
        };
      if (trendDelta < -5)
        return {
          id: "trend",
          title: "Consistency trend",
          value: `↓ Down ${Math.abs(trendDelta)}%`,
          detail: `Completion dropped ${Math.abs(trendDelta)}% vs last week. One extra check-in a day will turn this around.`,
          icon: "⚠️",
          severity: "warning",
        };
      return {
        id: "trend",
        title: "Consistency trend",
        value: "→ Steady",
        detail: `Within ${Math.abs(trendDelta)}% of last week. Consistency is building.`,
        icon: "📊",
        severity: "neutral",
      };
    })();

    const insights = [
      // 1. Best performing day
      {
        id: "best",
        title: "Best performing day",
        value: bestDay ? bestDay.fullLabel : "—",
        detail: bestDay
          ? `${bestDay.count} of ${totalHabits} habits completed (${bestDay.pct}%)`
          : "No completions recorded yet.",
        icon: "🏆",
        severity: "positive",
      },

      // 2. Least active day
      {
        id: "worst",
        title: "Least active day",
        value: worstDay ? worstDay.fullLabel : "—",
        detail: worstDay
          ? `${worstDay.count} of ${totalHabits} habits completed (${worstDay.pct}%)`
          : "No data yet.",
        icon: "📉",
        severity: worstDay?.pct === 0 ? "warning" : "neutral",
      },

      // 3. Most consistent habit
      {
        id: "consistent",
        title: "Most consistent habit",
        value: mostConsistent ? mostConsistent.name : "—",
        detail: mostConsistent
          ? `${mostConsistent.pct}% all-time completion rate — your most reliable routine.`
          : "Add habits to find your consistency leader.",
        icon: "⭐",
        severity: mostConsistent?.pct >= 70 ? "positive" : "neutral",
      },

      // 4. Consistency trend (week-over-week)
      trendInsight,

      // 5. Drop pattern
      {
        id: "drop",
        title: "Drop pattern detected",
        value:
          droppingHabits.length === 0
            ? "No drops this week"
            : droppingHabits.length === 1
              ? droppingHabits[0].name
              : `${droppingHabits.length} habits slipping`,
        detail:
          droppingHabits.length === 0
            ? "All habits maintained consistent check-ins this week."
            : droppingHabits.length === 1
              ? `"${droppingHabits[0].name}" was active early in the week but missed the last 3 days.`
              : `${droppingHabits.map((h) => `"${h.name}"`).join(", ")} were active earlier but quiet recently.`,
        icon: droppingHabits.length === 0 ? "✅" : "🔔",
        severity: droppingHabits.length === 0 ? "positive" : "warning",
      },
    ];

    return {
      dailyData,
      weeklyPct,
      trendDelta,
      insights,
      totalDone,
      totalPossible,
    };
  }, [habits]);
}
