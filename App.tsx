import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import AuthScreen from './src/screens/AuthScreen';

import FocusScreen from './screens/FocusScreen';
import FitnessScreen from './screens/FitnessScreen';
import HabitsScreen from './screens/HabitsScreen';
import KnowledgeBaseScreen from './screens/KnowledgeBaseScreen';
import SettingsScreen from './screens/SettingsScreen';
import IdeasScreen from './screens/IdeasScreen';

const App: React.FC = () => {
    // Check for saved theme preference on initial load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // Default to dark or user preference
            document.documentElement.classList.add('dark');
        }
    }, []);

    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/auth" element={<AuthScreen />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Navigate to="/focus" replace />} />
                        <Route path="/focus" element={<FocusScreen />} />
                        <Route path="/fitness" element={<FitnessScreen />} />
                        <Route path="/habits" element={<HabitsScreen />} />
                        <Route path="/knowledge-base" element={<KnowledgeBaseScreen />} />
                        <Route path="/ideas" element={<IdeasScreen />} />
                        <Route path="/settings" element={<SettingsScreen />} />
                    </Route>

                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;