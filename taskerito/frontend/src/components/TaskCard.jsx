import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import styles from './TaskCard.module.css';

const PRIORITY_BAR = {
    'Low': styles.priorityLow,
    'Medium': styles.priorityMedium,
    'High': styles.priorityHigh,
    'Critical': styles.priorityCritical,
};

function formatDeadline(deadline) {
    if (!deadline) return null;
    const date = new Date(deadline);
    const isOverdue = date < new Date();
    return { label: date.toLocaleDateString('uk-UA'), isOverdue };
}

export default function TaskCard({ task, onEdit, onDelete, canManage }) {
    const deadline = formatDeadline(task.deadline);
    const barClass = PRIORITY_BAR[task.priority] || styles.priorityDefault;

    return (
        <div className={styles.card}>
            <div className={`${styles.priorityBar} ${barClass}`} />
            <div className={styles.content}>
                <div className={styles.header}>
                    <Link to={`/tasks/${task.id}`} className={styles.title}>
                        {task.title}
                    </Link>
                    <StatusBadge label={task.priority} />
                </div>

                {task.description && (
                    <p className={styles.desc}>{task.description}</p>
                )}

                <div className={styles.meta}>
                    <StatusBadge label={task.status} />
                    {deadline && (
                        <span className={deadline.isOverdue ? styles.deadlineOverdue : styles.deadline}>
                            📅 {deadline.label}
                        </span>
                    )}
                </div>

                {canManage && (
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => onEdit(task)}>
                            Редагувати
                        </button>
                        <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => onDelete(task)}
                        >
                            Видалити
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
