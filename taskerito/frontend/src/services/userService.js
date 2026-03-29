import apiClient from './apiClient';

export const userService = {
    getMe: () => apiClient.get('/users/me'),
    getUser: (userId) => apiClient.get(`/users/${userId}`),
    getAllUsers: () => apiClient.get('/users/'),
    updateUser: (userId, data) => apiClient.patch(`/users/${userId}`, data),
};
