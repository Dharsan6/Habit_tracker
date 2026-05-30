import { useState } from "react";
import { FiUser, FiMail, FiLock, FiSave, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useAuth } from "../context/useAuth.jsx";
import useTheme from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { userEmail, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || userEmail?.split("@")[0] || "",
    email: userEmail || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setPwError("");
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    try {
      // Use the actual API utility
      const { api } = await import("../utils/api.js");
      const updatedUser = await api.patch("/auth/me", {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        newPassword: form.newPassword || undefined,
      });
      // Call updateUser if available
      if (typeof useAuth().updateUser === 'function') {
        useAuth().updateUser(updatedUser);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setPwError(err.message || "Failed to save profile");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const inputCls = "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-black outline-none transition focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-gray-600 dark:focus:bg-gray-800";
  const labelCls = "block text-sm font-medium text-black dark:text-white";

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-4 sm:px-6">
      {/* Header */}
      <section className="space-y-2">
        <span className="inline-flex rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black">
          Profile
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          Your account settings.
        </h1>
      </section>

      {/* Avatar + email summary */}
      <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white dark:bg-white dark:text-black text-2xl font-bold flex-shrink-0">
          {(form.firstName?.[0] || form.email?.[0] || "U").toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-black dark:text-white">
            {form.firstName && form.lastName ? `${form.firstName} ${form.lastName}` : form.username || "User"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{form.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-bold text-black dark:text-white">Personal information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>First name</label>
            <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="John" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last name</label>
            <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Doe" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Username</label>
          <div className="relative mt-1">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={form.username} onChange={set("username")} placeholder="johndoe" className={inputCls + " pl-9"} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <div className="relative mt-1">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls + " pl-9"} />
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />
        <h2 className="text-lg font-bold text-black dark:text-white">Change password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>New password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="password" value={form.newPassword} onChange={set("newPassword")} placeholder="••••••••" className={inputCls + " pl-9"} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Confirm password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" className={inputCls + " pl-9"} />
            </div>
          </div>
        </div>
        {pwError && (
          <p className="text-sm text-red-600 dark:text-red-400">{pwError}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            <FiSave className="h-4 w-4" />
            {saved ? "Saved!" : "Save changes"}
          </button>
          {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">✓ Profile updated</span>}
        </div>
      </form>

      {/* Danger zone */}

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-gray-900">
        <h2 className="mb-2 text-lg font-bold text-red-600 dark:text-red-400">Sign out</h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          You'll be redirected to the login page.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
        >
          <FiLogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
