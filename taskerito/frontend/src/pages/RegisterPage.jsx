import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useRequest } from '../hooks/useRequest';
import { useLoading } from '../store/LoadingContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { request } = useRequest();
    const { isLoading } = useLoading();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = 'Ім\'я — мінімум 2 символи';
        if (!email.trim() || !email.includes('@')) errs.email = 'Введіть коректний email';
        if (!password || password.length < 8) errs.password = 'Пароль — мінімум 8 символів';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setErrors({});
        try {
            await request(async () => {
                await authService.register({ full_name: fullName.trim(), email: email.trim(), password });
                toast.success('Реєстрацію завершено! Увійдіть у систему.');
                navigate('/login');
            }, { silent: true });
        } catch (err) {
            const detail = err.response?.data?.detail;
            setErrors({ general: typeof detail === 'string' ? detail : 'Помилка реєстрації. Спробуйте ще раз.' });
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.brandPanel}>
                <div className={styles.brandLogo}>
                    <span className={styles.brandDot} />
                    Taskerito
                </div>
                <div>
                    <h2 className={styles.brandTagline}>
                        Приєднуйся<span>до тисяч команд.</span>
                    </h2>
                </div>
                <p className={styles.brandFooter}>© 2026 Taskerito</p>
            </div>

            <div className={styles.formPanel}>
                <div className={styles.card}>
                    <h1 className={styles.heading}>Реєстрація</h1>
                    <p className={styles.subtitle}>Створіть акаунт безкоштовно</p>

                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                        {errors.general && (
                            <div className={styles.errorBox}>{errors.general}</div>
                        )}

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="reg-name">Повне ім'я</label>
                            <input
                                id="reg-name"
                                className={styles.input}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Іван Петренко"
                                autoComplete="name"
                            />
                            {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
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
                            <label className={styles.label} htmlFor="reg-password">Пароль (мін. 8 символів)</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.input}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Введіть пароль"
                                    autoComplete="new-password"
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
                            {isLoading ? 'Реєстрація...' : 'Зареєструватись'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        Вже є акаунт?{' '}
                        <Link to="/login" className={styles.link}>Увійти</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
