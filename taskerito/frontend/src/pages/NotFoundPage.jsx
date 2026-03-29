import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
    return (
        <div className={styles.page}>
            <div className={styles.code}>404</div>
            <p className={styles.message}>Сторінку не знайдено</p>
            <p className={styles.sub}>Схоже, ця адреса не існує або була переміщена</p>
            <Link to="/projects" className={styles.link}>← Повернутись на головну</Link>
        </div>
    );
}
