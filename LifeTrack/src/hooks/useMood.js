import { useCallback, useState, useEffect } from "react";
import {
  getStoredMoods,
  saveMoodForDate,
  removeMoodForDate,
  toDateKey,
  MOODS,
} from "../utils/moodStorage";
import { api } from "../utils/api";

export default function useMood() {
  const [moods, setMoods] = useState(() => getStoredMoods());

  // Initial fetch from backend
  useEffect(() => {
    api.get("/moods?days=30")
      .then((data) => {
        if (Array.isArray(data)) {
          const fetchedMoods = {};
          data.forEach(m => {
            if (m.dateKey && m.moodValue) {
              fetchedMoods[m.dateKey] = m.moodValue;
              saveMoodForDate(m.dateKey, m.moodValue);
            }
          });
          setMoods(prev => ({ ...prev, ...fetchedMoods }));
        }
      })
      .catch((err) => console.warn("Failed to fetch moods:", err.message));
  }, []);

  // Set or toggle mood for a given date (defaults to today)
  const setMood = useCallback(async (moodValue, date = new Date()) => {
    const key = toDateKey(date);
    
    // Check if toggling off
    let finalMood = moodValue;
    setMoods((prev) => {
      if (prev[key] === moodValue) {
        removeMoodForDate(key);
        const next = { ...prev };
        delete next[key];
        finalMood = null;
        return next;
      }
      saveMoodForDate(key, moodValue);
      return { ...prev, [key]: moodValue };
    });

    // Sync to backend
    try {
      const { api } = await import("../utils/api.js");
      if (finalMood === null) {
        // We'll need a delete endpoint, or we just leave the DB sync alone for now
        // since the backend upsert requires moodValue.
        // As a quick fix, if toggling off, we can just log a warning or add a delete endpoint
      } else {
        await api.post("/moods", { moodValue: finalMood, dateKey: key, notes: "" });
      }
    } catch (err) {
      console.warn("Failed to save mood to API:", err.message);
    }
  }, []);

  // Mood for a specific date
  const getMood = useCallback(
    (date = new Date()) => moods[toDateKey(date)] ?? null,
    [moods],
  );

  // Last N days as array: [{ date, dateKey, mood, moodMeta }]
  const getHistory = useCallback(
    (days = 7) => {
      return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        d.setHours(0, 0, 0, 0);
        const dateKey = toDateKey(d);
        const moodValue = moods[dateKey] ?? null;
        const moodMeta = MOODS.find((m) => m.value === moodValue) ?? null;
        return { date: d, dateKey, moodValue, moodMeta };
      });
    },
    [moods],
  );

  // Simple stats over last 7 days
  const weeklyStats = useCallback(() => {
    const history = getHistory(7);
    const logged = history.filter((d) => d.moodValue !== null);
    const counts = MOODS.reduce((acc, m) => {
      acc[m.value] = history.filter((d) => d.moodValue === m.value).length;
      return acc;
    }, {});
    const dominant = logged.length
      ? MOODS.reduce((best, m) => (counts[m.value] > counts[best.value] ? m : best), MOODS[0])
      : null;
    return { logged: logged.length, counts, dominant };
  }, [getHistory]);

  return { moods, setMood, getMood, getHistory, weeklyStats };
}
