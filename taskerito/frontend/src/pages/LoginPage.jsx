import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { useAuth } from '../store/AuthContext';
import { useRequest } from '../hooks/useRequest';
import { useLoading } from '../store/LoadingContext';
import styles from './AuthPage.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const { request } = useRequest();
    const { isLoading } = useLoading();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!email.trim()) errs.email = 'Email обов\'язковий';
        if (!password) errs.password = 'Пароль обов\'язковий';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setErrors({});
        try {
            await request(async () => {
                const tokenRes = await authService.login(email, password);
                const { access_token, refresh_token } = tokenRes.data;
                localStorage.setItem('taskerito_access_token', access_token);
                const userRes = await userService.getMe();
                login(userRes.data, access_token, refresh_token);
                toast.success(`Ласкаво просимо, ${userRes.data.full_name}!`);
                navigate('/projects');
            }, { silent: true });
        } catch (err) {
            const detail = err.response?.data?.detail;
            setErrors({ general: typeof detail === 'string' ? detail : 'Невірний email або пароль' });
            localStorage.removeItem('taskerito_access_token');
        }
    };

    return (
        <div className={styles.page}>
            {/* Ліва брендова панель */}
            <div className={styles.brandPanel}>
                <div className={styles.brandLogo}>
                    <span className={styles.brandDot} />
                    Taskerito
                </div>
                <div>
                    <h2 className={styles.brandTagline}>
                        Управляй проектами.<span>Досягай більшого.</span>
                    </h2>
                </div>
                <p className={styles.brandFooter}>© 2026 Taskerito</p>
            </div>

            {/* Права панель — форма */}
            <div className={styles.formPanel}>
                <div className={styles.card}>
                    <h1 className={styles.heading}>Вхід</h1>
                    <p className={styles.subtitle}>Введіть дані для входу в систему</p>

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        {errors.general && (
                            <div className={styles.errorBox}>{errors.general}</div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                autoComplete="email"
                            />
                            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="login-password">Пароль</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Введіть пароль"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeBtn}
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Приховати пароль' : 'Показати пароль'}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        Немає акаунту?{' '}
                        <Link to="/register" className={styles.link}>Зареєструватись</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
