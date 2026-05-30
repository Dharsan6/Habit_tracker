import { Link, useLocation } from "react-router-dom";
import { FiHome, FiPieChart, FiCheckCircle, FiX, FiBarChart2, FiSmile, FiTrendingUp, FiUser } from "react-icons/fi";

const menuItems = [
  { path: "/dashboard",  label: "Dashboard",  icon: FiHome },
  { path: "/habits",     label: "Habits",     icon: FiCheckCircle },
  { path: "/mood",       label: "Mood",       icon: FiSmile },
  { path: "/expenses",   label: "Expenses",   icon: FiBarChart2 },
  { path: "/budgets",    label: "Budgets",    icon: FiPieChart },
  { path: "/analytics",  label: "Analytics",  icon: FiTrendingUp },
  { path: "/profile",    label: "Profile",    icon: FiUser },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-gray-200 bg-white transition-transform dark:border-gray-800 dark:bg-black md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <span className="text-lg font-bold text-black dark:text-white">LifeTrack</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "text-gray-600 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
