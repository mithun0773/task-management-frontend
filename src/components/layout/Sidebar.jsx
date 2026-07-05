import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { RoleGuard } from "../common/RoleGuard";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  LogOut,
  User,
  Calendar,
  Bell,
  Folder,
  Settings,
  CheckCircle,
} from "lucide-react";

export default function Sidebar({ isCollapsed = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      path: "/projects",
      label: "Projects",
      icon: FolderKanban,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      path: "/tasks",
      label: "Tasks",
      icon: CheckSquare,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    // {
    //   path: "/calendar",
    //   label: "Calendar",
    //   icon: Calendar,
    //   roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    // },
    {
      path: "/team",
      label: "Team",
      icon: Users,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      path: "/reports",
      label: "Reports",
      icon: FileText,
      roles: ["ADMIN", "PROJECT_MANAGER"],
    },
    // {
    //   path: "/notifications",
    //   label: "Notifications",
    //   icon: Bell,
    //   roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    // },
    {
      path: "/files",
      label: "Files",
      icon: Folder,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
      roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
    },
  ];

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"} bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 transition-all duration-300`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-white" />
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold">TaskPro</h1>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <RoleGuard key={item.path} allowedRoles={item.roles}>
              <li>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            </RoleGuard>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} w-full px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-lg transition-all font-medium`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
