import React, { useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiEdit3,
  FiMoreHorizontal,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import StreakBadge from "./StreakBadge";
import {
  calculateStreak,
  getCompletionPercentage,
  getLast7Days,
  isHabitCompletedOnDate,
  normalizeDate,
} from "../utils/habitUtils";

export default function HabitCard({ habit, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);

  const streak = calculateStreak(habit.completionDates);
  const percentage = getCompletionPercentage(habit);
  const last7Days = getLast7Days();
  const completionSet = new Set(habit.completionDates.map((date) => normalizeDate(date).getTime()));
  const completedThisWeek = last7Days.filter((date) => isHabitCompletedOnDate(habit, date)).length;
  const todayTime = normalizeDate(new Date()).getTime();
  const completedToday = completionSet.has(todayTime);

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(habit.id, editName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(habit.name);
    }
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-gray-700" />

      <div className="mb-6 flex items-start justify-between gap-4">
        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-black outline-none transition focus:border-gray-300 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-gray-600 dark:focus:bg-gray-800"
            />
            <button
              onClick={handleSave}
              className="rounded-2xl bg-black p-3 text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              <FiCheck strokeWidth={3} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(habit.name);
              }}
              className="rounded-2xl bg-gray-100 p-3 text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FiX strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="flex-1">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    Habit
                  </span>
                  {completedToday ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Completed today
                    </span>
                  ) : null}
                </div>
                <h3 className="break-words text-2xl font-bold leading-tight tracking-tight text-black dark:text-white">
                  {habit.name}
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StreakBadge streak={streak} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                <FiCalendar className="h-3.5 w-3.5" />
                {completedThisWeek}/7 this week
              </span>
            </div>
          </div>
        )}

        {!isEditing ? (
          <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-2xl border border-gray-200 bg-white p-3 text-gray-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:text-black dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
              aria-label={`Edit ${habit.name}`}
            >
              <FiEdit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(habit.id)}
              className="rounded-2xl border border-gray-200 bg-white p-3 text-gray-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Delete habit"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-100 p-3 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <FiMoreHorizontal className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-4 transition-colors duration-200 group-hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:group-hover:bg-gray-900">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
            Consistency
          </div>
          <div className="mt-2 text-2xl font-bold text-black dark:text-white">
            {percentage}%
          </div>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-4 transition-colors duration-200 group-hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:group-hover:bg-gray-900">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
            Status
          </div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-black dark:text-white">
            <FiCheckCircle className={completedToday ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"} />
            {completedToday ? "On track" : "Pending"}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-5">
        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
              Last 7 days
            </span>
            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
              Tap to update
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            {last7Days.map((date, idx) => {
              const isCompleted = completionSet.has(date.getTime());
              const isToday = date.getTime() === normalizeDate(new Date()).getTime();
              const dayName = new Intl.DateTimeFormat("en-US", { weekday: "narrow" }).format(date);

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => onToggle(habit.id, date.toISOString())}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/15"
                        : "border-gray-200 bg-white text-gray-600 shadow-sm hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                    } ${isToday && !isCompleted ? "ring-2 ring-sky-200 ring-offset-2 ring-offset-white dark:ring-sky-700 dark:ring-offset-gray-900" : ""}`}
                    title={date.toDateString()}
                    aria-pressed={isCompleted}
                  >
                    <FiCheck
                      strokeWidth={4}
                      className={`h-3.5 w-3.5 transition-opacity ${isCompleted ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      isToday
                        ? "text-black dark:text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-1 dark:border-gray-700">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-black text-black dark:text-white">
              {percentage}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-black transition-all duration-700 ease-out dark:bg-white"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
