import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/AuthContext';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import { useRequest } from '../hooks/useRequest';
import { useLoading } from '../store/LoadingContext';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';
import styles from './TaskDetailPage.module.css';

const STATUSES = ['To Do', 'In Progress', 'Done', 'Cancelled'];

export default function TaskDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { request } = useRequest();
    const { isLoading } = useLoading();
    
    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                await request(async () => {
                    const [taskRes, commentsRes] = await Promise.all([
                        taskService.getTask(id),
                        commentService.getTaskComments(id),
                    ]);
                    setTask(taskRes.data);
                    setComments(commentsRes.data);
                });
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchData();
    }, [id, request]);

    const handleStatusChange = async (newStatus) => {
        const res = await request(() => taskService.updateTaskStatus(id, newStatus), {
            errorMsg: 'Помилка зміни статусу'
        });
        if (res) {
            setTask(res.data);
            toast.success(`Статус змінено на "${newStatus}"`);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const res = await request(() => commentService.addComment({ 
            content: commentText.trim(), 
            task_id: parseInt(id) 
        }), { errorMsg: 'Помилка додавання коментаря' });

        if (res) {
            setComments((prev) => [...prev, res.data]);
            setCommentText('');
        }
    };

    if (isInitialLoading) return null;
    if (!task) return <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>Задачу не знайдено</div>;

    const deadline = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadline && deadline < new Date() && task.status !== 'Done';

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.breadcrumb}>
                    <Link to={`/projects/${task.project_id}`} className={styles.backLink}>
                        ← Назад до проекту
                    </Link>
                </div>

                <div className={styles.header}>
                    <h1 className={styles.title}>{task.title}</h1>
                    <div className={styles.meta}>
                        <StatusBadge label={task.status} />
                        <StatusBadge label={task.priority} />
                        {isOverdue && <span className={styles.overdue}>⚠ Прострочено</span>}
                    </div>
                </div>

                {task.description && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Опис</h2>
                        <p className={styles.description}>{task.description}</p>
                    </div>
                )}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Інформація</h2>
                    <dl className={styles.info}>
                        {deadline && (
                            <>
                                <dt>Дедлайн</dt>
                                <dd className={isOverdue ? styles.overdueText : ''}>
                                    {deadline.toLocaleString('uk-UA')}
                                </dd>
                            </>
                        )}
                        <dt>Проект ID</dt>
                        <dd>{task.project_id}</dd>
                    </dl>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Змінити статус</h2>
                    <div className={styles.statusRow}>
                        {STATUSES.map((s) => (
                            <button
                                key={s}
                                className={`${styles.statusBtn} ${task.status === s ? styles.statusBtnActive : ''}`}
                                onClick={() => handleStatusChange(s)}
                                disabled={isLoading || task.status === s}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Коментарі {comments.length > 0 && `(${comments.length})`}
                    </h2>

                    {comments.length === 0 ? (
                        <p className={styles.noComments}>Коментарів ще немає</p>
                    ) : (
                        <div className={styles.commentList}>
                            {comments.map((c) => (
                                <div key={c.id} className={styles.comment}>
                                    <div className={styles.commentMeta}>
                                        <span className={styles.commentAuthor}>
                                            Користувач #{c.user_id}
                                        </span>
                                        <span className={styles.commentDate}>
                                            {new Date(c.created_at).toLocaleString('uk-UA')}
                                        </span>
                                    </div>
                                    <p className={styles.commentText}>{c.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleAddComment} className={styles.commentForm}>
                        <textarea
                            className={styles.commentInput}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Напишіть коментар..."
                            rows={3}
                        />
                        <button
                            type="submit"
                            className={styles.commentBtn}
                            disabled={!commentText.trim() || isLoading}
                        >
                            {isLoading ? 'Відправка...' : 'Додати коментар'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
