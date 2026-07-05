import api from "./axios";

export const searchApi = {
  global: (query, type = "") => {
    const params = new URLSearchParams({ q: query });
    if (type) params.append("type", type);
    return api.get(`/dashboard/search?${params}`).then((res) => res.data);
  },

  getTeamStats: () => api.get("/dashboard/team-stats").then((res) => res.data),
};
