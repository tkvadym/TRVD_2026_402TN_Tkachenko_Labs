import apiClient from './apiClient';

export const taskService = {
    getTask: (taskId) => apiClient.get(`/tasks/${taskId}`),
    createTask: (data) => apiClient.post('/tasks/', data),
    updateTask: (taskId, data) => apiClient.patch(`/tasks/${taskId}`, data),
    updateTaskStatus: (taskId, status) => apiClient.patch(`/tasks/${taskId}/status`, { status }),
    deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
    getTasksByProject: (projectId) => apiClient.get(`/tasks/project/${projectId}`),
};
