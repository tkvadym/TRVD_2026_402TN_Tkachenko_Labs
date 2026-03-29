import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageSquare, Trash2, Users, Plus, ChevronLeft } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { dashboardService } from '../services/dashboardService';
import { projectMemberService } from '../services/projectMemberService';
import { commentService } from '../services/commentService';
import { userService } from '../services/userService';
import { useRequest } from '../hooks/useRequest';
import { useLoading } from '../store/LoadingContext';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';
import styles from './ProjectDetailPage.module.css';
import gStyles from '../styles/global.module.css';

const formatDate = (dateString, noTime = false) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (noTime) return d.toLocaleDateString();
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function ProjectDetailPage() {
    const { id } = useParams();
    const { user, isManager } = useAuth();
    const { request } = useRequest();
    const { isLoading } = useLoading();
    
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [members, setMembers] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const [deletingTask, setDeletingTask] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const [panelMode, setPanelMode] = useState(null); 
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const [allUsers, setAllUsers] = useState([]);

    const fetchAll = useCallback(async (showLoader = true) => {
        try {
            await request(async () => {
                const [projRes, membersRes, tasksRes] = await Promise.all([
                    projectService.getProject(id),
                    projectMemberService.getMembers(id),
                    taskService.getTasksByProject(id)
                ]);
                setProject(projRes.data);
                setMembers(membersRes.data || []);
                setTasks(tasksRes.data || []);

                if (isManager) {
                    const statsRes = await dashboardService.getProjectDashboard(id);
                    setStats(statsRes.data);
                }
            }, { showLoader });
        } finally {
            setIsInitialLoading(false);
        }
    }, [id, isManager, request]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const handleQuickCreate = async (e) => {
        if (e.key === 'Enter' && newTaskTitle.trim()) {
            const res = await request(() => taskService.createTask({
                title: newTaskTitle.trim(),
                status: 'To Do',
                priority: 'Medium',
                project_id: parseInt(id)
            }), { errorMsg: 'Помилка створення задачі' });

            if (res) {
                setTasks(prev => [...prev, res.data]);
                setNewTaskTitle('');
                toast.success('Задачу створено');
                if (isManager) {
                    request(() => dashboardService.getProjectDashboard(id), { showLoader: false })
                        .then(r => setStats(r.data));
                }
            }
        }
    };

    const handleInlineUpdate = async (taskId, field, value) => {
        const t = tasks.find(x => x.id === taskId);
        if (!t || t[field] === value) return;

        let finalValue = value;
        if (field === 'deadline' && value) {
            finalValue = new Date(value).toISOString();
        } else if (field === 'deadline' && !value) {
            finalValue = null; 
        }

        try {
            // Оптимістичне оновлення UI
            setTasks(prev => prev.map(x => x.id === taskId ? { ...x, [field]: finalValue } : x));

            await request(async () => {
                if (field === 'status') {
                    await taskService.updateTaskStatus(taskId, finalValue);
                } else {
                    await taskService.updateTask(taskId, { [field]: finalValue });
                }
                if (isManager) {
                    const r = await dashboardService.getProjectDashboard(id);
                    setStats(r.data);
                }
            }, { errorMsg: 'Не вдалось зберегти ' + field });
        } catch (err) {
            fetchAll(false); // Rollback
        }
    };

    const handleDeleteTask = async () => {
        const success = await request(() => taskService.deleteTask(deletingTask.id), {
            errorMsg: 'Помилка видалення задачі'
        });

        if (success) {
            setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
            setDeletingTask(null);
            toast.success('Задачу видалено');
            if (isManager) {
                dashboardService.getProjectDashboard(id).then(r => setStats(r.data));
            }
        }
    };

    const openCommentsPanel = async (task) => {
        setSelectedTask(task);
        setPanelMode('comments');
        const res = await request(() => commentService.getCommentsByTask(task.id), {
            errorMsg: 'Помилка завантаження коментарів'
        });
        if (res) setComments(res.data || []);
    };

    const openMembersPanel = async () => {
        setPanelMode('members');
        const res = await request(() => userService.getAllUsers(), {
            errorMsg: 'Помилка завантаження користувачів'
        });
        if (res) setAllUsers(res.data || []);
    };

    const openAssigneePanel = (task) => {
        setSelectedTask(task);
        setPanelMode('assignee');
    };

    const closePanel = () => {
        setPanelMode(null);
        setSelectedTask(null);
        setComments([]);
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const res = await request(() => commentService.addComment({
            task_id: selectedTask.id,
            content: newComment.trim()
        }), { errorMsg: 'Помилка надсилання коментаря' });

        if (res) {
            setComments(prev => [...prev, res.data]);
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, comment_count: (t.comment_count || 0) + 1 } : t));
            setNewComment('');
        }
    };

    const handleAddMember = async (userId) => {
        const success = await request(() => projectMemberService.addMember(id, userId), {
            errorMsg: 'Помилка додавання учасника'
        });
        if (success) {
            toast.success('Учасника додано');
            fetchAll(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        const success = await request(() => projectMemberService.removeMember(id, userId), {
            errorMsg: 'Помилка видалення учасника'
        });
        if (success) {
            toast.success('Учасника видалено');
            fetchAll(false);
        }
    };

    const getAssigneeName = (userId) => {
        if (!userId) return '-';
        const m = members.find(mbr => mbr.user?.id === userId);
        return m?.user ? m.user.full_name : `User #${userId}`;
    };

    if (isInitialLoading) return null;
    if (!project) return <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>Проект не знайдено</div>;

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.breadcrumb}>
                    <Link to="/projects" className={styles.backLink}>
                        <ChevronLeft size={16} /> Всі проекти
                    </Link>
                </div>

                <div className={styles.projectHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <h1 className={styles.projectTitle} style={{ margin: 0 }}>{project.name}</h1>
                        <StatusBadge label={project.status} />
                    </div>
                    {project.description && (
                        <p className={styles.projectDesc} style={{ flexBasis: '100%', marginTop: 'var(--space-2)' }}>{project.description}</p>
                    )}
                </div>

                {isManager && stats && (
                    <div className={styles.statsBar}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Всього</span>
                            <span className={styles.statValue}>{stats.total_tasks}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>To Do</span>
                            <span className={styles.statValue}>{stats.tasks_to_do}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Процес</span>
                            <span className={styles.statValue}>{stats.tasks_in_progress}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>Готово</span>
                            <span className={styles.statValue}>{stats.tasks_done}</span>
                        </div>
                        {stats.overdue_tasks_count > 0 && (
                            <div className={`${styles.statItem} ${styles.statItemOverdue}`}>
                                <span className={styles.statLabel}>Прострок</span>
                                <span className={styles.statValue}>{stats.overdue_tasks_count}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.tasksHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <h2 className={styles.tasksTitle}>Задачі</h2>
                        <span className={styles.tasksCount}>{tasks.length}</span>
                    </div>
                    {isManager && (
                        <button className={styles.createBtn} onClick={openMembersPanel} style={{ padding: '6px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} /> Учасники ({members.length})
                        </button>
                    )}
                </div>

                <div className={gStyles.tableContainer}>
                    <table className={gStyles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Назва</th>
                                <th style={{ width: '140px' }}>Статус</th>
                                <th style={{ width: '120px' }}>Пріоритет</th>
                                <th style={{ width: '160px' }}>Виконавець</th>
                                <th style={{ width: '140px' }}>Дедлайн</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>Комент.</th>
                                {isManager && <th style={{ width: '60px' }}>Дії</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className={gStyles.clickableRow}>
                                    <td onClick={() => openCommentsPanel(task)}>#{task.id}</td>
                                    <td>
                                        {isManager ? (
                                            <input
                                                className={styles.inlineInput}
                                                defaultValue={task.title}
                                                onBlur={(e) => handleInlineUpdate(task.id, 'title', e.target.value)}
                                            />
                                        ) : (
                                            <span onClick={() => openCommentsPanel(task)}>{task.title}</span>
                                        )}
                                    </td>
                                    <td>
                                        <select
                                            className={styles.inlineSelect}
                                            defaultValue={task.status}
                                            onChange={(e) => handleInlineUpdate(task.id, 'status', e.target.value)}
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </td>
                                    <td>
                                        {isManager ? (
                                            <select
                                                className={styles.inlineSelect}
                                                defaultValue={task.priority}
                                                onChange={(e) => handleInlineUpdate(task.id, 'priority', e.target.value)}
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        ) : (
                                            task.priority
                                        )}
                                    </td>
                                    <td>
                                        {isManager ? (
                                            <div
                                                onClick={() => openAssigneePanel(task)}
                                                style={{ cursor: 'pointer', padding: 'var(--space-2) 0', minWidth: '100px', display: 'block', color: 'var(--text-primary)' }}
                                            >
                                                {getAssigneeName(task.assigned_to)}
                                            </div>
                                        ) : (
                                            getAssigneeName(task.assigned_to)
                                        )}
                                    </td>
                                    <td>
                                        {isManager ? (
                                            <input
                                                type="date"
                                                className={styles.inlineInput}
                                                defaultValue={task.deadline ? task.deadline.split('T')[0] : ''}
                                                onBlur={(e) => handleInlineUpdate(task.id, 'deadline', e.target.value)}
                                            />
                                        ) : (
                                            <span style={{ color: 'var(--text-tertiary)' }}>{formatDate(task.deadline, true)}</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => openCommentsPanel(task)}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <MessageSquare size={16} color="var(--text-primary)" /> {task.comment_count || 0}
                                        </div>
                                    </td>
                                    {isManager && (
                                        <td>
                                            <button className={`${gStyles.actionBtn} ${gStyles.danger}`} onClick={(e) => { e.stopPropagation(); setDeletingTask(task); }}>
                                                <Trash2 size={16} color="var(--text-primary)" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {isManager && (
                                <tr>
                                    <td style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}><Plus size={16} /></td>
                                    <td colSpan={isManager ? 7 : 6}>
                                        <input
                                            className={styles.inlineInput}
                                            style={{ borderStyle: 'none' }}
                                            placeholder="Введіть назву задачі і натисніть Enter..."
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                            onKeyDown={handleQuickCreate}
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* ВИЇЗНА ПАНЕЛЬ */}
            {panelMode && (
                <div className={styles.panelOverlay} onClick={(e) => { if (e.target === e.currentTarget) closePanel(); }}>
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className={styles.panelTitle}>
                                    {panelMode === 'comments' ? `#${selectedTask?.id} Коментарі` :
                                        panelMode === 'assignee' ? `Призначити виконавця (#${selectedTask?.id})` :
                                            `Учасники проекту`}
                                </span>
                                {selectedTask && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{selectedTask.title}</span>}
                            </div>
                            <button className={styles.closePanelBtn} onClick={closePanel}>×</button>
                        </div>

                        <div className={styles.panelBody}>
                            {panelMode === 'comments' && (
                                comments.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>Немає коментарів.</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} style={{ background: 'var(--bg-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                                <strong style={{ fontSize: 'var(--text-sm)' }}>
                                                    {c.author ? `${c.author.full_name} (${c.author.email})` : `User #${c.user_id}`}
                                                </strong>
                                                <small style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>{formatDate(c.created_at)}</small>
                                            </div>
                                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>{c.content}</p>
                                        </div>
                                    ))
                                )
                            )}

                            {panelMode === 'members' && (
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Поточні учасники:</h3>
                                    {members.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>Немає учасників</p>}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                                        {members.map(m => m.user && (
                                            <div key={m.user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-active)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span>{m.user.full_name}</span>
                                                    <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{m.user.email}</small>
                                                </div>
                                                {isManager && (
                                                    <button onClick={() => handleRemoveMember(m.user.id)} className={gStyles.danger} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 5px' }}>×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {isManager && (
                                        <>
                                            <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Додати учасника:</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                                {allUsers.filter(u => !members.find(m => m.user?.id === u.id)).map(u => (
                                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-subtle)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span>{u.full_name}</span>
                                                            <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{u.email}</small>
                                                        </div>
                                                        <button onClick={() => handleAddMember(u.id)} className={gStyles.btnPrimary} style={{ padding: '2px 8px', fontSize: '12px', minWidth: '30px' }}>+</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {panelMode === 'assignee' && (
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Призначений учасник:</h3>
                                    {selectedTask.assigned_to ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-active)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>{getAssigneeName(selectedTask.assigned_to)}</span>
                                                <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                                                    {members.find(m => m.user?.id === selectedTask.assigned_to)?.user?.email}
                                                </small>
                                            </div>
                                            <button
                                                onClick={() => { handleInlineUpdate(selectedTask.id, 'assigned_to', null); closePanel(); }}
                                                className={gStyles.danger}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 5px' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>Нікого не призначено</p>
                                    )}

                                    <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>Призначити:</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                        {members.filter(m => m.user && m.user.id !== selectedTask.assigned_to).map(m => (
                                            <div
                                                key={m.user.id}
                                                onClick={() => { handleInlineUpdate(selectedTask.id, 'assigned_to', m.user.id); closePanel(); }}
                                                style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-subtle)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                                className={gStyles.hoverableRow}
                                            >
                                                <span>{m.user.full_name}</span>
                                                <small style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{m.user.email}</small>
                                            </div>
                                        ))}
                                        {members.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>В проекті немає учасників</p>}
                                        {members.length > 0 && members.filter(m => m.user && m.user.id !== selectedTask.assigned_to).length === 0 && selectedTask.assigned_to && (
                                            <p style={{ color: 'var(--text-tertiary)' }}>Всі учасники проекту вже призначені (лише 1 виконавець)</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {panelMode === 'comments' && (
                            <div className={styles.panelFooter}>
                                <form onSubmit={handleSendComment} style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <input
                                        style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}
                                        placeholder="Написати коментар..."
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                    />
                                    <button type="submit" disabled={!newComment.trim() || isLoading} className={gStyles.btnPrimary} style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-2) var(--space-4)' }}>
                                        {isLoading ? '...' : '➤'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {deletingTask && (
                <ConfirmDialog
                    message={`Видалити задачу "${deletingTask.title}"?`}
                    onConfirm={handleDeleteTask}
                    onCancel={() => setDeletingTask(null)}
                />
            )}
        </div>
    );
}
