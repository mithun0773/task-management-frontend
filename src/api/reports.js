import api from "./axios";

export const reportsApi = {
  getAll: () => api.get("/reports").then((res) => res.data),

  getById: (id) => api.get(`/reports/${id}`).then((res) => res.data),

  create: (formData) => {
    return api
      .post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  updateStatus: (id, status) =>
    api.patch(`/reports/${id}/status`, { status }).then((res) => res.data),

  // ✅ Now accepts object with comment and optional parent_id
  addComment: (id, data) =>
    api.post(`/reports/${id}/comments`, data).then((res) => res.data),

  delete: (id) => api.delete(`/reports/${id}`).then((res) => res.data),

  getDownloadUrl: (id) => `http://localhost:3000/reports/${id}/download`,
};
