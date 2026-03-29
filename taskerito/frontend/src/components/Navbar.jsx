import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../store/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, role, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Вихід виконано');
        navigate('/login');
    };

    const initials = user?.full_name
        ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link to="/projects" className={styles.logo}>
                    <span className={styles.logoDot} />
                    Task<span>erito</span>
                </Link>

                {user && (
                    <div className={styles.userBlock}>
                        {isAdmin && (
                            <Link to="/admin" className={styles.adminLink}>
                                Адмін-панель
                            </Link>
                        )}
                        
                        <div className={styles.profilePill}>
                            <div className={styles.userAvatar}>{initials}</div>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.full_name}</span>
                                <span className={styles.userRole}>{role}</span>
                            </div>
                        </div>

                        <button className={styles.logoutBtn} onClick={handleLogout} title="Вийти">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
