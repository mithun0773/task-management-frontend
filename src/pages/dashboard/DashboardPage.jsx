import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { tasksApi } from "../../api/tasks";
import {
  FolderKanban,
  CheckSquare,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real data from backend
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/dashboard/stats").then((res) => res.data),
  });

  const { data: taskDistribution, isLoading: distLoading } = useQuery({
    queryKey: ["task-distribution"],
    queryFn: () =>
      api.get("/dashboard/task-distribution").then((res) => res.data),
  });

  const { data: upcomingTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["upcoming-tasks"],
    queryFn: () => api.get("/dashboard/upcoming-tasks").then((res) => res.data),
  });

  const { data: recentProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["recent-projects"],
    queryFn: () =>
      api.get("/dashboard/recent-projects").then((res) => res.data),
  });

  const { data: teamWorkload, isLoading: workloadLoading } = useQuery({
    queryKey: ["team-workload"],
    queryFn: () => api.get("/dashboard/team-workload").then((res) => res.data),
  });

  // ✅ NEW: Fetch ALL tasks to calculate real progress per project
  const { data: allTasks = [] } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: () => tasksApi.getAll(),
  });

  const calculateProjectProgress = (projectId) => {
    const projectTasks = allTasks.filter((t) => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(
      (t) => t.status === "DONE",
    ).length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const isLoading =
    statsLoading ||
    distLoading ||
    tasksLoading ||
    projectsLoading ||
    workloadLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Projects"
          value={stats?.totalProjects || 0}
          icon={<FolderKanban size={24} className="text-indigo-500" />}
          trend="+2 this month"
          trendUp={true}
        />
        <StatCard
          title="Tasks"
          value={stats?.totalTasks || 0}
          icon={<CheckSquare size={24} className="text-indigo-500" />}
          trend="+8 this week"
          trendUp={true}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress || 0}
          icon={<Clock size={24} className="text-indigo-500" />}
          trend="—"
          trendUp={null}
        />
        <StatCard
          title="Completed"
          value={stats?.completed || 0}
          icon={<CheckCircle size={24} className="text-green-500" />}
          trend="+12 this week"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Overview - Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tasks Overview
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {taskDistribution?.map((item) => {
                const total = taskDistribution.reduce(
                  (sum, i) => sum + i.value,
                  0,
                );
                const percentage =
                  total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.value} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Tasks</h3>
            {/* ✅ WORKING BUTTON: Navigate to Tasks page */}
            <button
              onClick={() => navigate("/tasks")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {upcomingTasks?.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {task.assignee?.first_name?.[0] || "?"}
                      {task.assignee?.last_name?.[0] || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.project?.name || "No Project"}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "No date"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No upcoming tasks
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Projects</h3>
            {/* ✅ WORKING BUTTON: Navigate to Projects page */}
            <button
              onClick={() => navigate("/projects")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {recentProjects?.length > 0 ? (
              recentProjects.map((project) => {
                // ✅ REAL PROGRESS CALCULATION
                const progress = calculateProjectProgress(project.id);
                const progressColor =
                  progress === 100
                    ? "bg-green-500"
                    : progress >= 50
                      ? "bg-blue-500"
                      : progress > 0
                        ? "bg-orange-500"
                        : "bg-gray-300";

                return (
                  <div key={project.id} className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        project.status === "ACTIVE"
                          ? "bg-blue-500"
                          : project.status === "ON_HOLD"
                            ? "bg-orange-500"
                            : project.status === "COMPLETED"
                              ? "bg-green-500"
                              : "bg-gray-400"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {project.name}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                    <div className="w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${progressColor} transition-all`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No projects yet
              </p>
            )}
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Team Workload</h3>
            {/* ✅ WORKING BUTTON: Navigate to Team page */}
            <button
              onClick={() => navigate("/team")}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {teamWorkload?.length > 0 ? (
              teamWorkload.map((member) => {
                const percentage = Math.min(
                  (member.workload / member.maxWorkload) * 100,
                  100,
                );
                return (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {member.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {member.name}
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No team members yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trendUp === true && (
              <TrendingUp size={14} className="text-green-500" />
            )}
            {trendUp === false && (
              <TrendingDown size={14} className="text-red-500" />
            )}
            {trendUp === null && <Minus size={14} className="text-gray-400" />}
            <span
              className={`text-xs ${
                trendUp === true
                  ? "text-green-500"
                  : trendUp === false
                    ? "text-red-500"
                    : "text-gray-400"
              }`}
            >
              {trend}
            </span>
          </div>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    PLANNING: "bg-gray-100 text-gray-700",
    ARCHIVED: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        styles[status] || styles["PLANNING"]
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-orange-100 text-orange-700",
    LOW: "bg-gray-100 text-gray-700",
    CRITICAL: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        styles[priority] || styles["LOW"]
      }`}
    >
      {priority}
    </span>
  );
}
