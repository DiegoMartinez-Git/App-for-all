import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';

const SettingsScreen: React.FC = () => {
    // Initialize state based on current DOM class
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Profile State
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<{ full_name: string; email: string; avatar_url: string } | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        if (!user) return;

        const getProfile = async () => {
            setLoadingProfile(true);
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
            } else {
                // Fallback to auth metadata if profile doesn't exist yet/fails
                setProfile({
                    full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuario',
                    email: user.email || '',
                    avatar_url: user.user_metadata.avatar_url || ''
                });
            }
            setLoadingProfile(false);
        };

        getProfile();
    }, [user]);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex font-display">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-10 relative">
                <header className="mb-8 flex items-center gap-3">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-primary">
                        <span className="material-symbols-outlined text-2xl">menu</span>
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black mb-1">Configuración</h1>
                        <p className="text-text-secondary text-sm md:text-base">Personaliza tu experiencia en AllForDev.</p>
                    </div>
                </header>

                <div className="max-w-2xl flex flex-col gap-8">
                    <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person</span>
                            Perfil
                        </h2>
                        {loadingProfile ? (
                            <p className="text-text-secondary">Cargando perfil...</p>
                        ) : (
                            <>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="size-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-400">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            profile?.full_name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{profile?.full_name || 'Usuario'}</h3>
                                        <p className="text-text-secondary">Miembro</p>
                                        <button
                                            onClick={signOut}
                                            className="text-sm text-red-500 hover:underline mt-2 flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">logout</span>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Nombre de Usuario</label>
                                        <input
                                            type="text"
                                            value={profile?.full_name || ''}
                                            readOnly
                                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-2 focus:ring-primary text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={profile?.email || ''}
                                            readOnly
                                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-2 focus:ring-primary text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </section>

                    <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            Preferencias
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-dark-light transition-colors">
                                <div>
                                    <p className="font-medium">Modo Oscuro</p>
                                    <p className="text-sm text-text-secondary">Ajustar apariencia de la interfaz</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block w-6 h-6 transform bg-white rounded-full shadow transition duration-200 ease-in-out ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-surface-dark-light transition-colors">
                                <div>
                                    <p className="font-medium">Sonidos de Temporizador</p>
                                    <p className="text-sm text-text-secondary">Reproducir sonido al terminar Pomodoro</p>
                                </div>
                                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full bg-primary">
                                    <span className="translate-x-6 inline-block w-6 h-6 transform bg-white rounded-full shadow transition duration-200 ease-in-out"></span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">dangerous</span>
                            Zona de Peligro
                        </h2>
                        <button className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-2 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
                            <span className="material-symbols-outlined text-lg">delete_forever</span>
                            Borrar todos los datos y reiniciar
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default SettingsScreen;