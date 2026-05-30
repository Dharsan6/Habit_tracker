import React, { useMemo, useState } from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiPlus,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import useHabits from "../hooks/useHabits";
import HabitCard from "../components/HabitCard";
import StatCard from "../components/StatCard";
import { getHabitSummary } from "../utils/habitStats";
import {
  calculateStreak,
  getCompletionPercentage,
  isHabitCompletedOnDate,
  normalizeDate,
} from "../utils/habitUtils";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FilterSortBar from "../components/FilterSortBar.jsx";
import WeeklyProgressCard from "../components/WeeklyProgressCard.jsx";
import InsightCards from "../components/InsightCards.jsx";

export default function Habits() {
  const { habits, isLoaded, addHabit, toggleHabit, deleteHabit, editHabitName } = useHabits();
  const [newHabitName, setNewHabitName] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [habitToDelete, setHabitToDelete] = useState(null);
  const summary = useMemo(() => getHabitSummary(habits), [habits]);
  const today = useMemo(() => normalizeDate(new Date()), []);

  const visibleHabits = useMemo(() => {
    const filtered = habits.filter((habit) => {
      const completedToday = isHabitCompletedOnDate(habit, today);
      if (filter === "completed") return completedToday;
      if (filter === "pending")   return !completedToday;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "streak") {
        const diff = calculateStreak(b.completionDates) - calculateStreak(a.completionDates);
        if (diff !== 0) return diff;
      }
      if (sortBy === "consistency") {
        const diff = getCompletionPercentage(b) - getCompletionPercentage(a);
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filter, habits, sortBy, today]);

  const consistencyScore = useMemo(() => {
    if (habits.length === 0) return 0;

    const totalConsistency = habits.reduce(
      (sum, habit) => sum + getCompletionPercentage(habit),
      0,
    );

    return Math.round(totalConsistency / habits.length);
  }, [habits]);

  const insights = useMemo(() => {
    const topStreakHabit = habits.reduce((best, habit) => {
      const streak = calculateStreak(habit.completionDates);

      if (!best || streak > best.streak) {
        return { name: habit.name, streak };
      }

      return best;
    }, null);

    const pendingCount = habits.filter((habit) => !isHabitCompletedOnDate(habit, today)).length;

    return [
      {
        title: "Momentum",
        description:
          summary.weeklyProgress >= 70
            ? `You are sustaining strong momentum with ${summary.weeklyProgress}% weekly completion.`
            : `Weekly completion is ${summary.weeklyProgress}%. One extra check-in a day would noticeably lift this.`,
        icon: "momentum",
      },
      {
        title: "Top performer",
        description: topStreakHabit
          ? `${topStreakHabit.name} is leading with a ${topStreakHabit.streak}-day streak.`
          : "Your first habit will unlock streak-based comparisons here.",
        icon: "champion",
      },
      {
        title: "Focus today",
        description:
          pendingCount === 0
            ? "Everything scheduled for today is complete. Keep the streaks alive tomorrow."
            : `${pendingCount} habit${pendingCount === 1 ? "" : "s"} still need attention today.`,
        icon: "focus",
      },
    ];
  }, [habits, summary.weeklyProgress, today]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName);
    setNewHabitName("");
  };

  const handleDeleteHabit = (id) => {
    const habit = habits.find((item) => item.id === id);
    setHabitToDelete(habit ?? null);
  };

  const confirmDeleteHabit = () => {
    if (!habitToDelete) return;
    deleteHabit(habitToDelete.id);
    setHabitToDelete(null);
  };

  if (!isLoaded) return null;

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-4 sm:px-6 lg:px-8">
        <section className="space-y-3">
          <span className="inline-flex rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black">
            Habits
          </span>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-5xl [word-break:break-word]">
                Build consistent routines with less friction.
              </h1>
              <p className="text-base leading-7 text-gray-600 dark:text-gray-300">
                Add habits, review your recent check-ins, and keep your streaks visible without
                cluttering the flow.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total habits"
            value={summary.totalHabits}
            hint="Active routines in your tracker"
            icon={FiTarget}
            tone="slate"
          />
          <StatCard
            label="Completed today"
            value={summary.completedToday}
            hint={`${summary.completionPercentage}% of habits finished`}
            icon={FiCheckCircle}
            tone="emerald"
          />
          <StatCard
            label="Weekly progress"
            value={`${summary.weeklyProgress}%`}
            hint={`${summary.totalWeeklyCompletions}/${summary.weeklyTarget || 0} check-ins this week`}
            icon={FiTrendingUp}
            tone="sky"
          />
          <StatCard
            label="Consistency score"
            value={`${consistencyScore}%`}
            hint="Average completion rate across all active habits"
            icon={FiActivity}
            tone="amber"
          />
        </section>

        <section className="rounded-[2rem] border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-4">
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="habit-name" className="sr-only">
                Habit name
              </label>
              <input
                id="habit-name"
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="What habit do you want to build next?"
                className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-100 px-5 py-4 text-black outline-none transition focus:border-gray-300 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-gray-600 dark:focus:bg-gray-800"
              />
            </div>
            <button
              type="submit"
              disabled={!newHabitName.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-black px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
            >
              <FiPlus className="h-4 w-4" />
              Add habit
            </button>
          </form>
        </section>

        {habits.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <FilterSortBar
              filter={filter}
              sortBy={sortBy}
              onFilterChange={setFilter}
              onSortChange={setSortBy}
              resultCount={visibleHabits.length}
              totalCount={habits.length}
            />

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <WeeklyProgressCard
                weeklyBreakdown={summary.weeklyBreakdown}
                weeklyProgress={summary.weeklyProgress}
              />
              <InsightCards insights={insights} />
            </section>

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={toggleHabit}
                  onDelete={handleDeleteHabit}
                  onEdit={editHabitName}
                />
              ))}
            </section>

            {visibleHabits.length === 0 ? (
              <section className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-6 py-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  No habits match this view
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Try a different filter or sort option to review the rest of your list.
                </p>
              </section>
            ) : null}
          </>
        )}
      </div>

      <Modal
        isOpen={Boolean(habitToDelete)}
        title="Delete habit?"
        description={
          habitToDelete
            ? `"${habitToDelete.name}" will be removed from your tracker. This cannot be undone.`
            : ""
        }
        onClose={() => setHabitToDelete(null)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setHabitToDelete(null)}
              className="rounded-[1.25rem] border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteHabit}
              className="rounded-[1.25rem] bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete habit
            </button>
          </>
        }
      />
    </>
  );
}
