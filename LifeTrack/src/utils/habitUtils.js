export const normalizeDate = (dateOrStr) => {
  const d = new Date(dateOrStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const isHabitCompletedOnDate = (habit, dateOrStr) => {
  const targetTime = normalizeDate(dateOrStr).getTime();
  return habit.completionDates?.some((date) => normalizeDate(date).getTime() === targetTime) ?? false;
};

export const calculateStreak = (completionDates) => {
  if (!completionDates || !Array.isArray(completionDates) || completionDates.length === 0) return 0;
  const timestamps = [...new Set(completionDates.map(d => normalizeDate(d).getTime()))].sort((a, b) => b - a);
  const todayTime = normalizeDate(new Date()).getTime();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTime = normalizeDate(yesterday).getTime();

  if (timestamps[0] !== todayTime && timestamps[0] !== yesterdayTime) return 0;

  let streak = 0;
  let expectedDate = new Date(timestamps[0]);

  for (let ts of timestamps) {
    if (ts === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else break;
  }
  return streak;
};

export const migrateHabit = (habit) => {
  if (habit.completionDates) return habit;
  const completionDates = [];
  if (habit.completed || habit.completedToday) {
    completionDates.push(new Date().toISOString());
  }
  return { ...habit, completionDates };
};

export const getCompletionPercentage = (habit) => {
  if (!habit.completionDates || habit.completionDates.length === 0) return 0;
  const created = normalizeDate(habit.createdAt || new Date());
  const today = normalizeDate(new Date());
  let daysSinceCreation = Math.floor((today - created) / (1000 * 60 * 60 * 24)) + 1;
  const uniqueCompletions = new Set(habit.completionDates.map(d => normalizeDate(d).getTime())).size;
  if (daysSinceCreation < 1) daysSinceCreation = 1;
  return Math.min(100, Math.round((uniqueCompletions / daysSinceCreation) * 100));
};

export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(normalizeDate(d));
  }
  return days;
};
