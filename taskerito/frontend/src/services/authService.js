import apiClient from './apiClient';

export const authService = {
    // Реєстрація нового користувача
    register: (data) => apiClient.post('/users/', data),

    // Вхід: API приймає form-data (OAuth2PasswordRequestForm)
    login: (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        return apiClient.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
    },
};
