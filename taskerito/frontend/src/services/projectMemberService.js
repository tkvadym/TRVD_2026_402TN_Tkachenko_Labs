import apiClient from './apiClient';

export const projectMemberService = {
    getMembers: (projectId) => apiClient.get(`/projects/${projectId}/members/`),
    addMember: (projectId, userId) => apiClient.post(`/projects/${projectId}/members/${userId}`),
    removeMember: (projectId, userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`),
};
