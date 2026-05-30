import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.jsx";

export default function Login() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = useMemo(() => {
    const maybe = location.state?.from?.pathname;
    return typeof maybe === "string" && maybe ? maybe : "/dashboard";
  }, [location.state]);

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "", email: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password) {
        setError("All fields are required.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setIsSubmitting(true);
      const result = await register(form.firstName, form.lastName, form.username, form.email, form.password);
      setIsSubmitting(false);
      if (!result.ok) { setError(result.error || "Registration failed."); return; }
    } else {
      if (!form.email || !form.password) {
        setError("Please enter both email and password.");
        return;
      }
      setIsSubmitting(true);
      const result = await login(form.email, form.password);
      setIsSubmitting(false);
      if (!result.ok) { setError(result.error || "Invalid credentials."); return; }
    }
    navigate(fromPath, { replace: true });
  };

  const inputCls =
    "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-black outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-gray-500 dark:focus:bg-gray-800 dark:placeholder-gray-500";
  const labelCls = "block text-sm font-medium text-black dark:text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black mb-3 text-2xl font-bold">
            L
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">LifeTrack</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your all-in-one life productivity hub
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/40">
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            {["login", "register"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>First name</label>
                    <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="John" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Last name</label>
                    <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Doe" className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Username</label>
                  <input type="text" value={form.username} onChange={set("username")} placeholder="johndoe" className={inputCls} required />
                </div>
              </>
            )}

            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
                className={inputCls}
                required
              />
            </div>

            {mode === "register" && (
              <div>
                <label className={labelCls}>Confirm password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="••••••••"
                  className={inputCls}
                  required
                />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:focus:ring-gray-700"
            >
              {isSubmitting
                ? mode === "login" ? "Signing in…" : "Creating account…"
                : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="font-semibold text-black underline dark:text-white"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-600">
            Works offline too — any credentials accepted when backend is down.
          </p>
        </div>
      </div>
    </div>
  );
}
