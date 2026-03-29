import { useState } from 'react';
import styles from './Form.module.css';

const STATUSES = ['To Do', 'In Progress', 'Done', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function TaskForm({ initialData, projectId, onSubmit, onCancel, loading }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState(initialData?.status || 'To Do');
    const [priority, setPriority] = useState(initialData?.priority || 'Medium');
    const [deadline, setDeadline] = useState(
        initialData?.deadline ? initialData.deadline.substring(0, 16) : ''
    );
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!title.trim() || title.trim().length < 3) {
            errs.title = 'Назва повинна містити мінімум 3 символи';
        }
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        const data = {
            title: title.trim(),
            description: description.trim() || null,
            status,
            priority,
            project_id: projectId || initialData?.project_id,
            deadline: deadline ? new Date(deadline).toISOString() : null,
        };
        onSubmit(data);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
                <label className={styles.label}>Назва *</label>
                <input
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введіть назву задачі"
                />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Опис</label>
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Детальний опис задачі (необов'язково)"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Статус</label>
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Пріоритет</label>
                <select className={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Дедлайн</label>
                <input
                    type="datetime-local"
                    className={styles.input}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                    Скасувати
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Збереження...' : (initialData ? 'Зберегти' : 'Створити')}
                </button>
            </div>
        </form>
    );
}
