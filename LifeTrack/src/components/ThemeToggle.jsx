import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle({ theme = "light", onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-gray-800 dark:border-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-100"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
      <span className="hidden md:inline">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
