import api from "./axios";

export const tasksApi = {
  getAll: (status) => {
    const url = status ? `/tasks?status=${status}` : "/tasks";
    return api.get(url).then((res) => res.data);
  },

  getById: (id) => api.get(`/tasks/${id}`).then((res) => res.data),

  create: (data) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );
    return api.post("/tasks", cleanData).then((res) => res.data);
  },

  update: (id, data) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );
    return api.patch(`/tasks/${id}`, cleanData).then((res) => res.data);
  },

  delete: (id) => api.delete(`/tasks/${id}`).then((res) => res.data),
};
