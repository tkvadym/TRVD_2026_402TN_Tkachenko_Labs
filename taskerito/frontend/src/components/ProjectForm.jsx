import { useState } from 'react';
import styles from './Form.module.css';

const STATUSES = ['Active', 'Archived', 'Completed'];

export default function ProjectForm({ initialData, onSubmit, onCancel, loading }) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState(initialData?.status || 'Active');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!name.trim() || name.trim().length < 3) {
            errs.name = 'Назва повинна містити мінімум 3 символи';
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
        onSubmit({
            name: name.trim(),
            description: description.trim() || null,
            status,
        });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
                <label className={styles.label}>Назва проекту *</label>
                <input
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введіть назву проекту"
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Опис</label>
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опис проекту (необов'язково)"
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Статус</label>
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
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
