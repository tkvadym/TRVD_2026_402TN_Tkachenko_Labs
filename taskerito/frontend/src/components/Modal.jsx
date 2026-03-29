import { useEffect } from 'react';
import styles from './Modal.module.css';

export default function Modal({ title, onClose, children }) {
    // Закриваємо по Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити">
                        ✕
                    </button>
                </div>
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
}
