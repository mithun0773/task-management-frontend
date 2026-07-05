import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  FileText,
  Download,
  MessageSquare,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function ReportsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const isPM = hasRole(["PROJECT_MANAGER"]);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: reportsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: reportsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report deleted successfully");
      setDeleteId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => reportsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Status updated successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update status"),
  });

  // ✅ Status configuration (renamed from statusColors)
  const statusConfig = {
    PENDING: {
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock size={14} />,
      label: "Pending",
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
      label: "Enhancement",
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
            Reports & Review Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage all submitted work
          </p>
        </div>
        <Link
          to="/reports/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> Submit Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reports yet
          </h3>
          <p className="text-gray-500 mb-4">
            Submit your first report to get started
          </p>
          <Link
            to="/reports/create"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} /> Submit Report
          </Link>
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <FileText className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {report.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        By: {report.submitted_by?.first_name}{" "}
                        {report.submitted_by?.last_name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {report.description || "No description"}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span>Project: {report.project?.name || "N/A"}</span>
                  <span>
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <MessageSquare size={14} />
                  <span>{report.comments?.length || 0} comments</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={reportsApi.getDownloadUrl(report.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                  >
                    <Download size={14} /> Download
                  </a>
                  <Link
                    to={`/reports/${report.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  >
                    <Eye size={14} /> View
                  </Link>
                  {isPM && (
                    <button
                      onClick={() => setDeleteId(report.id)}
                      className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* ✅ PM Action Buttons */}
                {isPM && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: report.id,
                          status: "APPROVED",
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: report.id,
                          status: "REJECTED",
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                    <button
                      onClick={() =>
                        statusMutation.mutate({
                          id: report.id,
                          status: "NEEDS_ENHANCEMENT",
                        })
                      }
                      disabled={statusMutation.isPending}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg disabled:opacity-50"
                    >
                      <AlertTriangle size={12} /> Enhance
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
        title="Delete Report"
        message="Are you sure you want to delete this report? The file will also be removed from the server."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
