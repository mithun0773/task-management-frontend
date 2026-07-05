import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/projects") return "Projects";
    if (path === "/tasks") return "Tasks";
    if (path === "/calendar") return "Calendar";
    if (path === "/team") return "Team Members";
    if (path === "/reports") return "Reports";
    if (path === "/notifications") return "Notifications";
    if (path === "/files") return "Files";
    if (path === "/settings") return "Settings";
    return "Dashboard";
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}
      >
        <Header
          title={getTitle()}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
