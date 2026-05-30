const API_BASE = "http://localhost:8080/api";

const getToken = () => {
  try {
    const raw = localStorage.getItem("lifetrack.auth");
    if (!raw) return null;
    return JSON.parse(raw)?.token || null;
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json.data ?? json;
}

export const api = {
  get:    (path) => request(path),
  post:   (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
