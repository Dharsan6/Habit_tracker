import axios from "axios";

const BASE = import.meta.env.VITE_AI_SERVICE_URL || "http://localhost:5000";

// AI endpoints don't use JWT in the python code (it relies on user_id), 
// but we should pass headers if we ever implement auth there.
const authHeaders = () => {
  const token = localStorage.getItem("lifetrack.auth") 
    ? JSON.parse(localStorage.getItem("lifetrack.auth")).token 
    : null;
  return {
    headers: { 
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}) 
    },
  };
};

/**
 * Get AI-driven recommendations based on user habits and moods
 */
export async function getRecommendations(userId, habits, moods) {
  try {
    const res = await axios.post(`${BASE}/recommendations`, {
      user_id: userId,
      habit_data: habits,
      mood_data: moods || []
    }, authHeaders());
    return res.data.data;
  } catch (err) {
    console.error("AI Recommendation Error:", err);
    return null;
  }
}

/**
 * Get behavioral patterns analysis
 */
export async function getBehavioralPatterns(userId, habits, moods) {
  try {
    const res = await axios.post(`${BASE}/patterns/behavioral`, {
      user_id: userId,
      habit_data: habits,
      mood_data: moods || []
    }, authHeaders());
    return res.data.data;
  } catch (err) {
    console.error("AI Pattern Error:", err);
    return null;
  }
}

/**
 * Get burnout risk analysis
 */
export async function getBurnoutAnalysis(userId, habits, moods) {
  try {
    const res = await axios.post(`${BASE}/analytics/burnout`, {
      user_id: userId,
      habit_data: habits,
      mood_data: moods || []
    }, authHeaders());
    return res.data.data;
  } catch (err) {
    console.error("AI Burnout Error:", err);
    return null;
  }
}

/**
 * Predict user productivity score
 */
export async function getProductivityPrediction(userId, habits, moods) {
  try {
    const res = await axios.post(`${BASE}/predict/productivity`, {
      user_id: userId,
      habit_data: habits,
      mood_data: moods || []
    }, authHeaders());
    return res.data.data;
  } catch (err) {
    console.error("AI Productivity Error:", err);
    return null;
  }
}
