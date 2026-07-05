import { Bell, Search, Menu, X, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchApi } from "../../api/search";
import { useQuery } from "@tanstack/react-query";

export default function Header({ title, onToggleSidebar, isSidebarCollapsed }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchApi.global(searchQuery),
    enabled: showSearchResults && searchQuery.trim().length >= 2,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const handleSearchResultClick = (item, type) => {
    setShowSearchResults(false);
    setSearchQuery("");

    if (type === "projects") {
      navigate(`/projects/${item.id}/edit`);
    } else if (type === "tasks") {
      navigate(`/tasks/${item.id}/edit`);
    } else if (type === "users") {
      navigate("/team");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Left: Toggle Button + Title + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>

          <h1 className="text-2xl font-bold text-gray-900 hidden lg:block">
            {title}
          </h1>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl ml-4" ref={searchRef}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search projects, tasks, team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults ? (
                  <div className="py-2">
                    {/* Projects Results */}
                    {searchResults.projects?.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                          Projects ({searchResults.projects.length})
                        </div>
                        {searchResults.projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() =>
                              handleSearchResultClick(project, "projects")
                            }
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
                          >
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <AlertCircle
                                size={16}
                                className="text-indigo-600"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {project.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {project.owner?.first_name}{" "}
                                {project.owner?.last_name}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tasks Results */}
                    {searchResults.tasks?.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                          Tasks ({searchResults.tasks.length})
                        </div>
                        {searchResults.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() =>
                              handleSearchResultClick(task, "tasks")
                            }
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <AlertCircle
                                size={16}
                                className="text-blue-600"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {task.project?.name} •{" "}
                                {task.assignee?.first_name}{" "}
                                {task.assignee?.last_name}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Users Results */}
                    {searchResults.users?.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                          Team Members ({searchResults.users.length})
                        </div>
                        {searchResults.users.map((userItem) => (
                          <button
                            key={userItem.id}
                            onClick={() =>
                              handleSearchResultClick(userItem, "users")
                            }
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {userItem.first_name[0]}
                                {userItem.last_name[0]}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {userItem.first_name} {userItem.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {userItem.email} •{" "}
                                {userItem.role.replace("_", " ")}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {!searchResults.projects?.length &&
                      !searchResults.tasks?.length &&
                      !searchResults.users?.length && (
                        <div className="p-4 text-center text-gray-500">
                          <AlertCircle
                            size={24}
                            className="mx-auto mb-2 text-gray-400"
                          />
                          <p className="text-sm">
                            No results found for "{searchQuery}"
                          </p>
                        </div>
                      )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications, User */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </button>
                <hr className="my-2" />
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
