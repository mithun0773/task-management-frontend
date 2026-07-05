import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Reply,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const [comment, setComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const isPM = hasRole(["PROJECT_MANAGER"]);

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => reportsApi.getById(id),
  });

  const commentMutation = useMutation({
    mutationFn: (data) => reportsApi.addComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      setComment("");
      setReplyingTo(null);
      toast.success("Comment added successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to add comment"),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => reportsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      toast.success("Status updated successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const data = { comment };
    if (replyingTo) {
      data.parent_id = replyingTo.id;
    }
    commentMutation.mutate(data);
  };

  const handleReply = (parentComment) => {
    setReplyingTo(parentComment);
    setComment("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setComment("");
  };

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700",
    REVIEWED: "bg-blue-100 text-blue-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (!report) return <div className="text-center py-12">Report not found</div>;

  // ✅ Separate top-level comments from replies
  const topLevelComments = report.comments?.filter((c) => !c.parent_id) || [];
  const getReplies = (parentId) =>
    report.comments?.filter((c) => c.parent_id === parentId) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
      >
        <ArrowLeft size={20} /> Back to Reports
      </button>

      {/* Report Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center">
              <FileText className="text-indigo-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {report.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Submitted by {report.submitted_by?.first_name}{" "}
                {report.submitted_by?.last_name} on{" "}
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 ${statusColors[report.status]}`}
          >
            {report.status === "PENDING" && <Clock size={16} />}
            {report.status === "REVIEWED" && <Eye size={16} />}
            {report.status === "APPROVED" && <CheckCircle size={16} />}
            {report.status === "REJECTED" && <XCircle size={16} />}
            {report.status}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Description
            </h3>
            <p className="text-gray-600">
              {report.description || "No description provided"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Project</h3>
            <p className="text-gray-600">{report.project?.name || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              File Details
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{report.file_name}</span>
              <span>•</span>
              <span>{(report.file_size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
          <a
            href={reportsApi.getDownloadUrl(report.id)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            <Download size={18} /> Download File
          </a>

          {isPM && (
            <>
              <button
                onClick={() => statusMutation.mutate("APPROVED")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <CheckCircle size={18} /> Approve
              </button>
              <button
                onClick={() => statusMutation.mutate("REJECTED")}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <XCircle size={18} /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare size={24} /> Discussion ({report.comments?.length || 0}
          )
        </h2>

        {/* ✅ Comment Form - All users can comment/reply */}
        <form
          onSubmit={handleAddComment}
          className="mb-6 pb-6 border-b border-gray-200"
        >
          {replyingTo && (
            <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Reply size={14} className="text-indigo-600" />
                <span className="text-indigo-700 font-medium">
                  Replying to {replyingTo.user?.first_name}{" "}
                  {replyingTo.user?.last_name}
                </span>
              </div>
              <button
                type="button"
                onClick={cancelReply}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  replyingTo ? "Write your reply..." : "Add a comment..."
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!comment.trim() || commentMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                >
                  <Send size={16} />{" "}
                  {commentMutation.isPending
                    ? "Posting..."
                    : replyingTo
                      ? "Post Reply"
                      : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* ✅ Threaded Comments List */}
        <div className="space-y-4">
          {topLevelComments.length > 0 ? (
            topLevelComments.map((c) => {
              const replies = getReplies(c.id);
              return (
                <CommentThread
                  key={c.id}
                  comment={c}
                  replies={replies}
                  onReply={handleReply}
                  currentUser={user}
                />
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Start the discussion!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Threaded Comment Component
function CommentThread({ comment, replies, onReply, currentUser }) {
  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">
            {comment.user?.first_name?.[0]}
            {comment.user?.last_name?.[0]}
          </span>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.user?.first_name} {comment.user?.last_name}
              </span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  comment.user?.role === "PROJECT_MANAGER"
                    ? "bg-blue-100 text-blue-700"
                    : comment.user?.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {comment.user?.role?.replace("_", " ")}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onReply(comment)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <Reply size={12} /> Reply
            </button>
          </div>
          <p className="text-gray-700 text-sm">{comment.comment}</p>
        </div>
      </div>

      {/* Replies (indented) */}
      {replies.length > 0 && (
        <div className="ml-12 space-y-3 border-l-2 border-gray-200 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {reply.user?.first_name?.[0]}
                  {reply.user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-xs">
                    {reply.user?.first_name} {reply.user?.last_name}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      reply.user?.role === "PROJECT_MANAGER"
                        ? "bg-blue-100 text-blue-700"
                        : reply.user?.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {reply.user?.role?.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{reply.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
