import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoadingContext = createContext();

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [loadingCount, setLoadingCount] = useState(0);

    const showLoading = useCallback(() => {
        setLoadingCount((prev) => prev + 1);
    }, []);

    const hideLoading = useCallback(() => {
        setLoadingCount((prev) => Math.max(0, prev - 1));
    }, []);

    const value = useMemo(() => ({
        showLoading,
        hideLoading,
        isLoading: loadingCount > 0
    }), [showLoading, hideLoading, loadingCount]);

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {loadingCount > 0 && <LoadingSpinner />}
        </LoadingContext.Provider>
    );
};
