export const HABITS_STORAGE_KEY = "lifetrack_habits";

export const getStoredHabits = () => {
  try {
    const habits = localStorage.getItem(HABITS_STORAGE_KEY);
    return habits ? JSON.parse(habits) : [];
  } catch (error) {
    console.error("Failed to read habits from localStorage:", error);
    return [];
  }
};

export const saveStoredHabits = (habits) => {
  try {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (error) {
    console.error("Failed to save habits to localStorage:", error);
  }
};
