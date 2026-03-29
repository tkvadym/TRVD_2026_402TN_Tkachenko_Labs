import apiClient from './apiClient';

export const projectService = {
    getUserProjects: (userId) => apiClient.get(`/projects/user/${userId}`),
    getProject: (projectId) => apiClient.get(`/projects/${projectId}`),
    createProject: (data) => apiClient.post('/projects/', data),
    updateProject: (projectId, data) => apiClient.patch(`/projects/${projectId}`, data),
    deleteProject: (projectId) => apiClient.delete(`/projects/${projectId}`),
};
