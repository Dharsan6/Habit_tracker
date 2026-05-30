import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import useTheme from "../hooks/useTheme.js";

export default function AppLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Navbar
        onMenuClick={() => setIsSidebarOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <main>
        <div className="motion-page-enter pb-8 pt-4 sm:pt-6">
          <div className="mx-auto max-w-7xl">{children ?? <Outlet />}</div>
        </div>
      </main>
    </div>
  );
}
