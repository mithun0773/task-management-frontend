import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../../api/project";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../context/AuthContext";
import { Plus, FolderKanban, Calendar, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [deleteId, setDeleteId] = useState(null);
  const isPM = hasRole(["PROJECT_MANAGER"]);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
      setDeleteId(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const getProgress = (projectId) => {
    const projectTasks = tasks.filter((t) => t.project_id === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === "DONE").length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const statusColors = {
    PLANNING: "bg-gray-100 text-gray-700",
    ACTIVE: "bg-blue-100 text-blue-700",
    ON_HOLD: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-purple-100 text-purple-700",
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your projects
          </p>
        </div>
        {isPM && (
          <Link
            to="/projects/create"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} /> New Project
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={projects.length}
          color="indigo"
        />
        <StatCard
          label="Active"
          value={projects.filter((p) => p.status === "ACTIVE").length}
          color="blue"
        />
        <StatCard
          label="Planning"
          value={projects.filter((p) => p.status === "PLANNING").length}
          color="gray"
        />
        <StatCard
          label="Completed"
          value={projects.filter((p) => p.status === "COMPLETED").length}
          color="green"
        />
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderKanban className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first project
          </p>
          {isPM && (
            <Link
              to="/projects/create"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus size={20} /> Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = getProgress(project.id);
            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <FolderKanban className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Owner: {project.owner?.first_name}{" "}
                        {project.owner?.last_name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[project.status] || statusColors.PLANNING}`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {project.description || "No description provided"}
                </p>

                {(project.start_date || project.end_date) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <Calendar size={14} />
                    <span>
                      {project.start_date &&
                        new Date(project.start_date).toLocaleDateString()}
                      {project.start_date && project.end_date && " - "}
                      {project.end_date &&
                        new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-semibold text-gray-700">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progress === 100 ? "bg-green-500" : progress > 0 ? "bg-indigo-500" : "bg-gray-300"}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {isPM && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Link
                      to={`/projects/${project.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(project.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will also be removed. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-50 text-gray-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}
      >
        <FolderKanban size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
