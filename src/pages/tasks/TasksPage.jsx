import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../../api/tasks";
import { useAuth } from "../../context/AuthContext";
import { RoleGuard } from "../../components/common/RoleGuard";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Edit2,
  Trash2,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const [deleteId, setDeleteId] = useState(null);

  const isAdmin = hasRole(["ADMIN"]);
  const isPM = hasRole(["PROJECT_MANAGER"]);
  const isMember = hasRole(["TEAM_MEMBER"]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
      setDeleteId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated");
    },
  });

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Role restrictions for dragging
    if (isAdmin) return; // Admins cannot drag
    if (isMember && task.assignee_id !== user?.id) return; // Members can only drag their own tasks

    if (task.status !== newStatus) {
      updateMutation.mutate({ id: taskId, data: { status: newStatus } });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const columns = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    IN_REVIEW: tasks.filter((t) => t.status === "IN_REVIEW"),
    DONE: tasks.filter((t) => t.status === "DONE"),
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
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop tasks to update their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {isPM && (
            <Link
              to="/tasks/create"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} /> New Task
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KanbanColumn
          title="To Do"
          count={columns.TODO.length}
          color="slate"
          tasks={columns.TODO}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDelete={setDeleteId}
          isPM={isPM}
        />
        <KanbanColumn
          title="In Progress"
          count={columns.IN_PROGRESS.length}
          color="blue"
          tasks={columns.IN_PROGRESS}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDelete={setDeleteId}
          isPM={isPM}
        />
        <KanbanColumn
          title="Review"
          count={columns.IN_REVIEW.length}
          color="orange"
          tasks={columns.IN_REVIEW}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDelete={setDeleteId}
          isPM={isPM}
        />
        <KanbanColumn
          title="Done"
          count={columns.DONE.length}
          color="green"
          tasks={columns.DONE}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDelete={setDeleteId}
          isPM={isPM}
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  color,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onDelete,
  isPM,
}) {
  const colors = {
    slate: "bg-slate-50 border-slate-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-orange-50 border-orange-200",
    green: "bg-green-50 border-green-200",
  };
  const textColors = {
    slate: "text-slate-700",
    blue: "text-blue-700",
    orange: "text-orange-700",
    green: "text-green-700",
  };
  const statusMap = {
    "To Do": "TODO",
    "In Progress": "IN_PROGRESS",
    Review: "IN_REVIEW",
    Done: "DONE",
  };

  return (
    <div
      className={`${colors[color]} border rounded-xl p-4 min-h-[600px] flex flex-col transition-colors`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, statusMap[title])}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200/50">
        <h3 className={`font-bold ${textColors[color]}`}>{title}</h3>
        <span className="bg-white px-2.5 py-0.5 text-xs font-bold rounded-full border border-gray-200 text-gray-600">
          {count}
        </span>
      </div>
      <div className="space-y-3 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onDelete={onDelete}
            isPM={isPM}
          />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onDragStart, onDelete, isPM }) {
  const [showMenu, setShowMenu] = useState(false);
  const { user, hasRole } = useAuth();
  const isMember = hasRole(["TEAM_MEMBER"]);
  const isAssignee = task.assignee_id === user?.id;

  // Determine if the card is draggable
  const isAdmin = hasRole(["ADMIN"]);
  const isDraggable = !isAdmin && (isPM || (isMember && isAssignee));

  const priorityColors = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-orange-100 text-orange-700",
    LOW: "bg-gray-100 text-gray-700",
    CRITICAL: "bg-purple-100 text-purple-700",
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group ${isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, task.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <Link
          to={`/tasks/${task.id}/edit`}
          className="font-semibold text-gray-900 text-sm flex-1 hover:text-indigo-600 line-clamp-2"
        >
          {task.title}
        </Link>
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          >
            <MoreVertical size={16} />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {isPM && (
                <Link
                  to={`/tasks/${task.id}/edit`}
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 size={14} /> Edit
                </Link>
              )}
              {isPM && (
                <button
                  onClick={() => {
                    onDelete(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 truncate">
        {task.project?.name || "No Project"}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority] || priorityColors.MEDIUM}`}
        >
          {task.priority}
        </span>
        {task.assignee && (
          <div
            className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center"
            title={`${task.assignee.first_name} ${task.assignee.last_name}`}
          >
            <span className="text-white text-[10px] font-bold">
              {task.assignee.first_name?.[0]}
              {task.assignee.last_name?.[0]}
            </span>
          </div>
        )}
      </div>

      {task.due_date && (
        <div className="flex items-center gap-1 mt-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <Calendar size={12} />
          <span>
            {new Date(task.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      {isDraggable && (
        <div className="mt-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} className="text-gray-400" />
        </div>
      )}
    </div>
  );
}
