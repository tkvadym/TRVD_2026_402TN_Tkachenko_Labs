import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <Modal title="Підтвердження" onClose={onCancel}>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
                <button className={styles.cancel} onClick={onCancel}>
                    Скасувати
                </button>
                <button className={styles.confirm} onClick={onConfirm}>
                    Видалити
                </button>
            </div>
        </Modal>
    );
}
