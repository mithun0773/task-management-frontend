import api from "./axios";

export const projectsApi = {
    getAll: () => api.get('/projects').then(res => res.data),

    getById : (id) => api.get(`/projects/${id}`).then(res => res.data),

    create : (data) => api.post('/projects',data).then(res => res.data),

    update: (id,data) => api.patch(`/projects/${id}`,data).then(res => res.data),

    delete: (id) => api.delete(`/projects/${id}`).then(res => res.data),
};

