import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project }) {
    const createdAt = new Date(project.created_at).toLocaleDateString('uk-UA');

    return (
        <Link to={`/projects/${project.id}`} className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.name}>{project.name}</h3>
                <StatusBadge label={project.status} />
            </div>
            {project.description && (
                <p className={styles.desc}>{project.description}</p>
            )}
            <div className={styles.footer}>
                <span className={styles.date}>Створено: {createdAt}</span>
                <span className={styles.arrow}>→</span>
            </div>
        </Link>
    );
}
