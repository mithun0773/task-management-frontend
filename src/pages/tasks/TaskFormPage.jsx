import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../../api/tasks";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Save, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    due_date: "",
    project_id: "",
    assignee_id: "",
  });

  const { data: task, isLoading: isFetching } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.getById(id),
    enabled: isEdit,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects").then((res) => res.data),
  });
  const { data: allUsers = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => api.get("/users").then((res) => res.data),
  });

  // Only Team Members can be assigned
  const assignableMembers = allUsers.filter((u) => u.role === "TEAM_MEMBER");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "TODO",
        due_date: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : "",
        project_id: task.project_id || "",
        assignee_id: task.assignee_id || "",
      });
    }
  }, [task]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit ? tasksApi.update(id, data) : tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(
        isEdit ? "Task updated successfully" : "Task created successfully",
      );
      navigate("/tasks");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error saving task"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = {
      ...formData,
      description: formData.description || undefined,
      due_date: formData.due_date || undefined,
      assignee_id: formData.assignee_id || undefined,
    };
    mutation.mutate(cleanData);
  };

  if (isFetching)
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );

  const isAdmin = hasRole(["ADMIN"]);
  const isPM = hasRole(["PROJECT_MANAGER"]);
  const isMember = hasRole(["TEAM_MEMBER"]);
  const isAssignee = task?.assignee_id === user?.id;

  const isReadOnly = isAdmin || (isMember && !isAssignee);
  const canEditStatus = isPM || (isMember && isAssignee);
  const canEditOtherFields = isPM;

  if (isReadOnly) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft size={20} /> Back to Tasks
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Lock className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Read Only Access
          </h2>
          <p className="text-gray-500">
            You do not have permission to edit this task.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft size={20} /> Back to Tasks
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Task" : "Create New Task"}
          </h1>
          {isMember && isAssignee && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
              You are assigned to this task
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={!canEditOtherFields}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={!canEditOtherFields}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.project_id}
                onChange={(e) =>
                  setFormData({ ...formData, project_id: e.target.value })
                }
                disabled={!canEditOtherFields}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee (Team Members Only)
              </label>
              <select
                value={formData.assignee_id}
                onChange={(e) =>
                  setFormData({ ...formData, assignee_id: e.target.value })
                }
                disabled={!canEditOtherFields}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Select Team Member</option>
                {assignableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                disabled={!canEditStatus}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                disabled={!canEditOtherFields}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                disabled={!canEditOtherFields}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium disabled:opacity-50"
            >
              <Save size={18} />{" "}
              {mutation.isPending
                ? "Saving..."
                : isEdit
                  ? "Update Task"
                  : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
