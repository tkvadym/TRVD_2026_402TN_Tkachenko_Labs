import apiClient from './apiClient';

export const commentService = {
    getCommentsByTask: (taskId) => apiClient.get(`/comments/task/${taskId}`),
    addComment: (data) => apiClient.post('/comments/', data),
};
