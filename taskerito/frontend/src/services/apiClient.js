import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Перехоплювач запитів: додає Bearer токен до кожного запиту
apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехоплювач відповідей: при 401 — очищає токен і перенаправляє на логін.
// Виняток: сам запит /auth/login — там 401 є очікуваною відповіддю при невірному паролі,
// тому помилку прокидаємо далі щоб компонент міг її відобразити.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url === '/auth/login';
        if (error.response?.status === 401 && !isLoginRequest) {
            tokenStorage.clearTokens();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

