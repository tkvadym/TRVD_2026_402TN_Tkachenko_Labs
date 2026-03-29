import styles from './StatusBadge.module.css';

const STATUS_CLASS = {
    'To Do': 'todo',
    'In Progress': 'inProgress',
    'Done': 'done',
    'Cancelled': 'cancelled',
    'Active': 'active',
    'Archived': 'archived',
    'Completed': 'completed',
    'Low': 'low',
    'Medium': 'medium',
    'High': 'high',
    'Critical': 'critical',
};

export default function StatusBadge({ label }) {
    const cls = STATUS_CLASS[label] || 'default';
    return <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>;
}
