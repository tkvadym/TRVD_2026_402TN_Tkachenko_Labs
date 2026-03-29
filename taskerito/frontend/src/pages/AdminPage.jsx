import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { useRequest } from '../hooks/useRequest';
import { useLoading } from '../store/LoadingContext';
import StatusBadge from '../components/StatusBadge';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import styles from './AdminPage.module.css';

const ROLE_NAMES = { 1: 'Member', 2: 'Manager', 3: 'Admin' };

export default function AdminPage() {
    const { request } = useRequest();
    const { isLoading } = useLoading();
    const [users, setUsers] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [roleId, setRoleId] = useState(1);
    const [isActive, setIsActive] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await request(() => userService.getAllUsers(), {
                errorMsg: 'Не вдалося завантажити список користувачів'
            });
            if (res) setUsers(res.data);
        } finally {
            setIsInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openEdit = (user) => {
        setEditingUser(user);
        setRoleId(user.role_id);
        setIsActive(user.is_active);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const res = await request(() => userService.updateUser(editingUser.id, {
            role_id: parseInt(roleId),
            is_active: isActive,
        }), { errorMsg: 'Помилка оновлення користувача' });

        if (res) {
            setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? res.data : u)));
            setEditingUser(null);
            toast.success('Користувача оновлено');
        }
    };

    if (isInitialLoading) return null;

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Адмін-панель</h1>
                    <span className={styles.count}>{users.length} користувачів</span>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ім'я</th>
                                <th>Email</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Дія</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className={styles.tdId}>#{user.id}</td>
                                    <td>{user.full_name}</td>
                                    <td className={styles.tdEmail}>{user.email}</td>
                                    <td><StatusBadge label={ROLE_NAMES[user.role_id] || 'Member'} /></td>
                                    <td>
                                        <StatusBadge label={user.is_active ? 'Active' : 'Cancelled'} />
                                    </td>
                                    <td>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => openEdit(user)}
                                        >
                                            Редагувати
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {editingUser && (
                <Modal title={`Редагувати: ${editingUser.full_name}`} onClose={() => setEditingUser(null)}>
                    <form onSubmit={handleUpdate} className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>Роль</label>
                            <select
                                className={styles.select}
                                value={roleId}
                                onChange={(e) => setRoleId(e.target.value)}
                            >
                                <option value={1}>Member</option>
                                <option value={2}>Manager</option>
                                <option value={3}>Admin</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                Акаунт активний
                            </label>
                        </div>
                        <div className={styles.actions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setEditingUser(null)}>
                                Скасувати
                            </button>
                            <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                                {isLoading ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
