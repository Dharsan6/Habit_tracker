// Mood values
export const MOODS = [
  { value: "happy",   emoji: "😊", label: "Happy"   },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "sad",     emoji: "😔", label: "Sad"     },
];

const MOOD_KEY = "lifetrack_moods";

// { "2025-07-10": "happy", "2025-07-11": "neutral", ... }
export function getStoredMoods() {
  try {
    return JSON.parse(localStorage.getItem(MOOD_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function saveMoodForDate(dateKey, moodValue) {
  const moods = getStoredMoods();
  moods[dateKey] = moodValue;
  localStorage.setItem(MOOD_KEY, JSON.stringify(moods));
}

export function removeMoodForDate(dateKey) {
  const moods = getStoredMoods();
  delete moods[dateKey];
  localStorage.setItem(MOOD_KEY, JSON.stringify(moods));
}

/** "2025-07-10" from a Date object */
export function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}
