import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useLoading } from '../store/LoadingContext';

/**
 * Хук для виконання запитів з автоматичним лоадером та обробкою помилок.
 * @returns {Object} { request }
 */
export const useRequest = () => {
    const { showLoading, hideLoading } = useLoading();

    const request = useCallback(async (asyncFn, options = {}) => {
        const {
            showLoader = true,
            errorMsg = null,
            silent = false // Якщо true, не показувати жодних тостів про помилки
        } = options;

        if (showLoader) showLoading();

        try {
            const result = await asyncFn();
            return result;
        } catch (err) {
            console.error('Request error:', err);
            
            if (!silent) {
                const message = errorMsg || err.response?.data?.detail || 'Сталася помилка при виконанні запиту';
                toast.error(message);
            }
            throw err;
        } finally {
            if (showLoader) hideLoading();
        }
    }, [showLoading, hideLoading]);

    return { request };
};
