import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiCheckSquare,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPieChart,
  FiSmile,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/useAuth.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/habits",    label: "Habits",    icon: FiCheckSquare },
  { to: "/mood",      label: "Mood",      icon: FiSmile },
  { to: "/expenses",  label: "Expenses",  icon: FiBarChart2 },
  { to: "/budgets",   label: "Budgets",   icon: FiPieChart },
  { to: "/analytics", label: "Analytics", icon: FiTrendingUp },
  { to: "/profile",   label: "Profile",   icon: FiUser },
];

export default function Navbar({ onMenuClick, theme, onThemeToggle }) {
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          {/* Logo + desktop nav */}
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
                <FiCheckSquare className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-black dark:text-white">LifeTracker</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900 sm:flex">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <FiUser className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-black dark:text-white">{userEmail}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <FiLogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile nav row */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-3 md:hidden">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
