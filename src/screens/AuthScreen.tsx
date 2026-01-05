import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';

const AuthScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isResetMode) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/#/settings', // Redirect to change/update password
                });
                if (error) throw error;
                alert('Se ha enviado un correo para restablecer tu contraseña.');
                setIsResetMode(false);
            } else if (isSignUp) {
                // Extract username from email (before @)
                const username = email.split('@')[0];

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: username,
                        },
                        emailRedirectTo: window.location.origin,
                    },
                });
                if (error) throw error;
                alert('¡Registro exitoso! Por favor verifica tu correo electrónico.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
            <div className="max-w-md w-full bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-surface-dark-light p-8">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src={logo} alt="AllForDev Logo" className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg" />
                    <h1 className="text-3xl font-black text-primary mb-2">AllForDev</h1>
                    <p className="text-text-secondary">Tu centro de control personal</p>
                </div>

                <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-background-dark p-1 rounded-lg">
                    <button
                        className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${!isSignUp ? 'bg-white dark:bg-surface-dark shadow text-primary' : 'text-text-secondary'}`}
                        onClick={() => { setIsSignUp(false); setIsResetMode(false); }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${isSignUp ? 'bg-white dark:bg-surface-dark shadow text-primary' : 'text-text-secondary'}`}
                        onClick={() => { setIsSignUp(true); setIsResetMode(false); }}
                    >
                        Registrarse
                    </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="tu@email.com"
                        />
                    </div>

                    {!isResetMode && (
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Procesando...' : (isResetMode ? 'Enviar Enlace de Recuperación' : (isSignUp ? 'Crear Cuenta' : 'Entrar'))}
                    </button>

                    {!isSignUp && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsResetMode(!isResetMode);
                                setError(null);
                            }}
                            className="text-sm text-primary hover:underline text-center mt-2"
                        >
                            {isResetMode ? 'Volver a Iniciar Sesión' : '¿Olvidaste tu contraseña?'}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
