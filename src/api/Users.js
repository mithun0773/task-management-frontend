import api from "./axios";

export const usersApi = {
  getAll: () => api.get("/users").then((res) => res.data),

  getById: (id) => api.get(`/users/${id}`).then((res) => res.data),

  update: (id, data) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined,
      ),
    );
    return api.patch(`/users/${id}`, cleanData).then((res) => res.data);
  },
};
