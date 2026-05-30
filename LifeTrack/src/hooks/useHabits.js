import { useCallback, useEffect, useState } from "react";
import { migrateHabit, normalizeDate } from "../utils/habitUtils";
import { getStoredHabits, saveStoredHabits } from "../utils/storage";
import { api } from "../utils/api";

export default function useHabits() {
  const [habits, setHabits] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const cachedHabits = getStoredHabits().map(migrateHabit);
    if (cachedHabits.length > 0) {
      setHabits(cachedHabits);
      setIsLoaded(true);
    }

    api.get("/habits")
      .then((data) => {
        // Backend returns habits with title field; frontend uses name — normalize
        const normalized = Array.isArray(data) ? data : [];
        const migratedHabits = normalized.map((h) =>
          migrateHabit({ ...h, name: h.name || h.title || "Unnamed" })
        );
        setHabits(migratedHabits);
        saveStoredHabits(migratedHabits);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.warn("API unavailable, using local storage:", err.message);
        if (cachedHabits.length === 0) setHabits([]);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveStoredHabits(habits);
  }, [habits, isLoaded]);

  const addHabit = useCallback(async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimistic = migrateHabit({
      id: tempId,
      name: trimmedName,
      title: trimmedName,
      completionDates: [],
      createdAt: new Date().toISOString(),
    });
    setHabits((prev) => [optimistic, ...prev]);

    try {
      const newHabit = await api.post("/habits", {
        title: trimmedName,
        category: "General",
        frequency: "DAILY",
        targetDays: 30,
      });
      const migrated = migrateHabit({ ...newHabit, name: newHabit.title || trimmedName });
      setHabits((prev) => prev.map((h) => (h.id === tempId ? migrated : h)));
    } catch (err) {
      console.warn("Failed to save habit to API:", err.message);
      // Keep optimistic entry with a stable id
      setHabits((prev) =>
        prev.map((h) => (h.id === tempId ? { ...h, id: Date.now() } : h))
      );
    }
  }, []);

  const toggleHabit = useCallback(async (id, dateIso = new Date().toISOString()) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        const targetTime = normalizeDate(dateIso).getTime();
        const hasCompleted = habit.completionDates.some(
          (d) => normalizeDate(d).getTime() === targetTime
        );
        const completionDates = hasCompleted
          ? habit.completionDates.filter((d) => normalizeDate(d).getTime() !== targetTime)
          : [...habit.completionDates, dateIso];

        const updatedHabit = { ...habit, completionDates };

        // Sync to backend
        const dateStr = new Date(dateIso).toISOString().split('T')[0]; // "YYYY-MM-DD"
        api
          .post(`/habits/${id}/toggle`, { date: dateStr })
          .catch((err) => console.warn("Toggle sync failed:", err.message));

        // Also try the check-in endpoint if completing today (legacy support)
        if (!hasCompleted && new Date(dateIso).toDateString() === new Date().toDateString()) {
          api
            .post(`/habits/${id}/checkin`, { notes: "" })
            .catch(() => {});
        }

        return updatedHabit;
      })
    );
  }, []);

  const deleteHabit = useCallback(async (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (!String(id).startsWith("temp")) {
      api.delete(`/habits/${id}`).catch((err) =>
        console.warn("Delete sync failed:", err.message)
      );
    }
  }, []);

  const editHabitName = useCallback(async (id, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const updated = { ...h, name: trimmedName, title: trimmedName };
        api
          .put(`/habits/${id}`, {
            title: trimmedName,
            category: h.category || "General",
            frequency: h.frequency || "DAILY",
            targetDays: h.targetDays || 30,
          })
          .catch((err) => console.warn("Edit sync failed:", err.message));
        return updated;
      })
    );
  }, []);

  return { habits, isLoaded, addHabit, toggleHabit, deleteHabit, editHabitName };
}
