import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function FilesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.getAll,
  });

  const statusConfig = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock size={14} />,
      label: "Pending Review",
    },
    REVIEWED: {
      color: "bg-blue-100 text-blue-700",
      icon: <Eye size={14} />,
      label: "Reviewed",
    },
    APPROVED: {
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle size={14} />,
      label: "Approved",
    },
    REJECTED: {
      color: "bg-red-100 text-red-700",
      icon: <XCircle size={14} />,
      label: "Rejected",
    },
    NEEDS_ENHANCEMENT: {
      color: "bg-orange-100 text-orange-700",
      icon: <AlertTriangle size={14} />,
      label: "Needs Enhancement",
    },
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
          <h1 className="text-2xl font-bold text-gray-900">
            My Files & Submissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your work and track its review status
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Upload size={18} /> Upload Work
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No submissions yet
          </h3>
          <p className="text-gray-500 mb-4">
            Upload your first file to get started
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Upload size={20} /> Upload Work
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const status = statusConfig[report.status] || statusConfig.PENDING;
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <FileText className="text-indigo-600" size={20} />
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                  {report.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Project: {report.project?.name || "N/A"}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span>{report.file_name}</span>
                  <span>•</span>
                  <span>{(report.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={reportsApi.getDownloadUrl(report.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                  >
                    <Download size={14} /> Download
                  </a>
                  <Link
                    to={`/reports/${report.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium"
                  >
                    <Eye size={14} /> View Feedback
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isUploadOpen && <UploadModal onClose={() => setIsUploadOpen(false)} />}
    </div>
  );
}

// Simple Upload Modal Component
function UploadModal({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "",
  });
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      import("../../api/axios").then((m) =>
        m.default.get("/projects").then((r) => r.data),
      ),
  });

  const mutation = useMutation({
    mutationFn: (data) => reportsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("File uploaded successfully!");
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Upload failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    const data = new FormData();
    data.append("file", file);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("project_id", formData.project_id);
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Upload Work</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            required
            value={formData.project_id}
            onChange={(e) =>
              setFormData({ ...formData, project_id: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
