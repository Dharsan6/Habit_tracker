import {
  calculateStreak,
  getCompletionPercentage,
  getLast7Days,
  isHabitCompletedOnDate,
  normalizeDate,
} from "./habitUtils";

export const getHabitSummary = (habits) => {
  const today = normalizeDate(new Date());
  const last7Days = getLast7Days();

  const totalHabits = habits.length;
  const completedToday = habits.filter((habit) => isHabitCompletedOnDate(habit, today)).length;
  const completionPercentage =
    totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);

  const totalWeeklyCompletions = habits.reduce((sum, habit) => {
    const weeklyCount = last7Days.filter((date) => isHabitCompletedOnDate(habit, date)).length;
    return sum + weeklyCount;
  }, 0);

  const weeklyTarget = totalHabits * last7Days.length;
  const weeklyProgress =
    weeklyTarget === 0 ? 0 : Math.round((totalWeeklyCompletions / weeklyTarget) * 100);

  const bestHabit = habits.reduce((best, habit) => {
    const streak = calculateStreak(habit.completionDates);
    if (!best || streak > best.streak) {
      return { id: habit.id, name: habit.name, streak };
    }
    return best;
  }, null);

  const consistencyLeader = habits.reduce((best, habit) => {
    const consistency = getCompletionPercentage(habit);
    if (!best || consistency > best.consistency) {
      return { id: habit.id, name: habit.name, consistency };
    }
    return best;
  }, null);

  const weeklyBreakdown = last7Days.map((date) => {
    const count = habits.filter((habit) => isHabitCompletedOnDate(habit, date)).length;

    return {
      date,
      count,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
    };
  });

  return {
    totalHabits,
    completedToday,
    completionPercentage,
    totalWeeklyCompletions,
    weeklyTarget,
    weeklyProgress,
    bestHabit,
    consistencyLeader,
    weeklyBreakdown,
  };
};
