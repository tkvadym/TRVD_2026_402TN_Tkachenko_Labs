import apiClient from './apiClient';

export const dashboardService = {
    getProjectDashboard: (projectId) => apiClient.get(`/dashboard/${projectId}`),
};
