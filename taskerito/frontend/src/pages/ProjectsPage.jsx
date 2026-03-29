import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit3, Trash2 } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { projectService } from '../services/projectService';
import { useRequest } from '../hooks/useRequest';
import { useLoading } from '../store/LoadingContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from './Page.module.css';
import gStyles from '../styles/global.module.css';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

export default function ProjectsPage() {
    const navigate = useNavigate();
    const { user, isManager } = useAuth();
    const { request } = useRequest();
    const { isLoading } = useLoading();
    const [projects, setProjects] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);

    const fetchProjects = async () => {
        try {
            const res = await request(() => projectService.getUserProjects(user.id));
            setProjects(res.data);
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreate = async (data) => {
        const res = await request(() => projectService.createProject(data), {
            errorMsg: 'Помилка створення проекту'
        });
        if (res) {
            setProjects((prev) => [res.data, ...prev]);
            setShowModal(false);
            toast.success('Проект створено!');
        }
    };

    const handleUpdate = async (data) => {
        const res = await request(() => projectService.updateProject(editingProject.id, data), {
            errorMsg: 'Помилка оновлення проекту'
        });
        if (res) {
            setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? res.data : p)));
            setEditingProject(null);
            toast.success('Проект оновлено!');
        }
    };

    const handleDelete = async () => {
        const success = await request(() => projectService.deleteProject(deletingProject.id), {
            errorMsg: 'Помилка видалення проекту'
        });
        if (success) {
            setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
            setDeletingProject(null);
            toast.success('Проект видалено');
        }
    };

    if (isInitialLoading) return null; // Global spinner will be shown by useRequest/LoadingProvider

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Мої проекти</h1>
                    {isManager && (
                        <button className={styles.createBtn} onClick={() => setShowModal(true)}>
                            + Новий проект
                        </button>
                    )}
                </div>

                {projects.length === 0 ? (
                    <div className={styles.empty}>
                        <p className={styles.emptyTitle}>Проектів поки немає</p>
                        {isManager && (
                            <p className={styles.emptyText}>Натисніть «+ Новий проект», щоб розпочати</p>
                        )}
                    </div>
                ) : (
                    <div className={gStyles.tableContainer}>
                        <table className={gStyles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Назва</th>
                                    <th>Опис</th>
                                    <th>Статус</th>
                                    <th>Створено</th>
                                    {isManager && <th>Дії</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((p) => (
                                    <tr 
                                        key={p.id}
                                        onClick={() => navigate(`/projects/${p.id}`)}
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-active)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td>#{p.id}</td>
                                        <td>
                                            <a href={`/projects/${p.id}`} style={{ fontWeight: 600, color: 'var(--color-lavender-500)', textDecoration: 'none' }}>
                                                {p.name}
                                            </a>
                                        </td>
                                        <td style={{ color: 'var(--text-tertiary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {p.description || '-'}
                                        </td>
                                        <td><StatusBadge label={p.status} /></td>
                                        <td style={{ color: 'var(--text-tertiary)' }}>{formatDate(p.created_at)}</td>
                                        {isManager && (
                                            <td>
                                                <div className={gStyles.tableActions}>
                                                    <button 
                                                        className={gStyles.actionBtn} 
                                                        onClick={(e) => { e.stopPropagation(); setEditingProject(p); }} 
                                                        title="Редагувати"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button 
                                                        className={`${gStyles.actionBtn} ${gStyles.danger}`} 
                                                        onClick={(e) => { e.stopPropagation(); setDeletingProject(p); }} 
                                                        title="Видалити"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {showModal && (
                <Modal title="Новий проект" onClose={() => setShowModal(false)}>
                    <ProjectForm
                        onSubmit={handleCreate}
                        onCancel={() => setShowModal(false)}
                        loading={isLoading}
                    />
                </Modal>
            )}

            {editingProject && (
                <Modal title="Редагувати проект" onClose={() => setEditingProject(null)}>
                    <ProjectForm
                        initialData={editingProject}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingProject(null)}
                        loading={isLoading}
                    />
                </Modal>
            )}

            {deletingProject && (
                <ConfirmDialog
                    message={`Ви впевнені, що хочете видалити проект "${deletingProject.name}"? Усі задачі та коментарі будуть видалені.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingProject(null)}
                />
            )}
        </div>
    );
}
