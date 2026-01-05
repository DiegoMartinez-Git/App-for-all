import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-primary">
                <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
