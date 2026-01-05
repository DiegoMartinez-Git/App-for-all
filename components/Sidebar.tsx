import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';
import logo from '../images/logo.png';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const { user, signOut } = useAuth();
    const [profile, setProfile] = React.useState<any>(null);

    React.useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [user]);

    const navItems = [
        { path: '/focus', label: 'Zona de Enfoque', icon: 'center_focus_strong' },
        { path: '/fitness', label: 'Fitness & Series', icon: 'fitness_center' },
        { path: '/ideas', label: 'Ideas de Negocio', icon: 'lightbulb' },
        { path: '/habits', label: 'Mis Hábitos', icon: 'check_circle' },
        { path: '/knowledge-base', label: 'Base de Conocimiento', icon: 'menu_book' }
    ];

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 w-64 bg-background-dark border-r border-surface-dark-light flex flex-col 
        transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                ></div>
            )}

            <aside className={sidebarClasses}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden p-0.5">
                                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-lg leading-tight">AllForDev</h1>
                                <p className="text-text-secondary text-xs">Version 1.0.0</p>
                            </div>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={onClose} className="md:hidden text-text-secondary hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {navItems.map(link => {
                            const isActive = currentPath === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:text-white hover:bg-surface-dark-light'}`}
                                >
                                    <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{link.icon}</span>
                                    <span className="text-sm font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                        <div className="h-px bg-surface-dark-light my-2"></div>
                        <Link
                            to="/settings"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPath === '/settings' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:text-white hover:bg-surface-dark-light'}`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium">Configuración</span>
                        </Link>
                        <button
                            onClick={() => {
                                onClose && onClose();
                                if (signOut) signOut();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-white hover:bg-surface-dark-light transition-colors text-left"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </nav>
                </div>
                <div className="mt-auto p-6 border-t border-surface-dark-light">
                    <div className="flex items-center gap-3">
                        {profile?.avatar_url ? (
                            <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${profile.avatar_url}")` }}></div>
                        ) : (
                            <div className="size-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-medium">{profile?.full_name || user?.email || 'Usuario'}</span>
                            <span className="text-text-secondary text-xs">Nivel 1</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;