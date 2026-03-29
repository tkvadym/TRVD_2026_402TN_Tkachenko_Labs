import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { LoadingProvider } from './store/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
    return (
        <BrowserRouter>
            <LoadingProvider>
                <AuthProvider>
                    <Routes>
                        {/* Публічні маршрути */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Захищені маршрути — тільки для авторизованих */}
                        <Route
                            path="/projects"
                            element={
                                <ProtectedRoute>
                                    <ProjectsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/projects/:id"
                            element={
                                <ProtectedRoute>
                                    <ProjectDetailPage />
                                </ProtectedRoute>
                            }
                        />


                        {/* Адмін-маршрут — тільки для ролі Admin */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requireAdmin={true}>
                                    <AdminPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Редіректи */}
                        <Route path="/" element={<Navigate to="/projects" replace />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </AuthProvider>
            </LoadingProvider>
        </BrowserRouter>
    );
}
