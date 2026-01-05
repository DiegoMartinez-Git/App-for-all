import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthContext';

interface Habit {
    id: number | string;
    title: string;
    category: 'Health' | 'Mind' | 'Work';
    streak: number;
    completed: boolean;
}

const HabitsScreen: React.FC = () => {
    const { user } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newHabit, setNewHabit] = useState('');
    const [newCategory, setNewCategory] = useState<'Health' | 'Mind' | 'Work'>('Health');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchHabits = async () => {
            const { data, error } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (data) {
                setHabits(data.map((h: any) => ({
                    id: h.id,
                    title: h.title,
                    category: h.category,
                    streak: h.streak,
                    completed: h.completed
                })));
            }
            setLoading(false);
        };
        fetchHabits();
    }, [user]);

    const toggleHabit = async (id: number | string) => {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        const newCompleted = !habit.completed;
        const newStreak = newCompleted ? habit.streak + 1 : (habit.streak > 0 ? habit.streak - 1 : 0); // Simplified streak logic

        // Optimistic update
        setHabits(habits.map(h =>
            h.id === id ? { ...h, completed: newCompleted, streak: newStreak } : h
        ));

        const { error } = await supabase
            .from('habits')
            .update({ completed: newCompleted, streak: newStreak })
            .eq('id', id);

        if (error) {
            // Revert on error
            setHabits(habits.map(h =>
                h.id === id ? { ...h, completed: habit.completed, streak: habit.streak } : h
            ));
        }
    };

    const addHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabit || !user) return;

        const newHabitObj = {
            user_id: user.id,
            title: newHabit,
            category: newCategory,
            streak: 0,
            completed: false
        };

        const { data, error } = await supabase
            .from('habits')
            .insert([newHabitObj])
            .select()
            .single();

        if (error) {
            alert('Error al crear hábito: ' + error.message);
        }

        if (data) {
            setHabits([...habits, {
                id: data.id,
                title: data.title,
                category: data.category,
                streak: data.streak,
                completed: data.completed
            }]);
            setNewHabit('');
            setIsAddOpen(false);
        }
    };

    const deleteHabit = async (id: number | string) => {
        // Optimistic update
        const prevHabits = [...habits];
        setHabits(habits.filter(h => h.id !== id));

        const { error } = await supabase.from('habits').delete().eq('id', id);

        if (error) {
            setHabits(prevHabits);
        }
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'Health': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Mind': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'Work': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-slate-400';
        }
    };

    const completionRate = habits.length > 0 ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex font-display">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-10 relative">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-primary">
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1">Mis Hábitos</h1>
                            <p className="text-text-secondary text-sm md:text-base">La constancia es la clave de la maestría.</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-text-secondary uppercase mb-1">Progreso Diario</p>
                        <div className="text-3xl md:text-4xl font-black text-primary">{completionRate}%</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main List */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {habits.map(habit => (
                            <div
                                key={habit.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${habit.completed ? 'bg-surface-dark-light/30 border-primary/20' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-surface-dark-light hover:border-slate-400'}`}
                            >
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    className={`size-8 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${habit.completed ? 'bg-primary border-primary' : 'border-slate-400 hover:border-primary'}`}
                                >
                                    {habit.completed && <span className="material-symbols-outlined text-white text-lg font-bold">check</span>}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-base md:text-lg truncate ${habit.completed ? 'line-through text-slate-500' : ''}`}>{habit.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded border inline-block mt-1 ${getCategoryColor(habit.category)}`}>
                                        {habit.category === 'Mind' ? 'Mente' : habit.category === 'Work' ? 'Trabajo' : 'Salud'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                                    <div className="text-center">
                                        <div className="flex items-center gap-1 text-orange-400">
                                            <span className="material-symbols-outlined text-lg icon-filled">local_fire_department</span>
                                            <span className="font-bold">{habit.streak}</span>
                                        </div>
                                        <span className="text-[10px] text-text-secondary uppercase hidden md:block">Racha</span>
                                    </div>
                                    <button onClick={() => deleteHabit(habit.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-text-secondary hover:text-primary hover:border-primary transition-colors font-bold flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Añadir Nuevo Hábito
                        </button>
                    </div>

                    {/* Stats Panel */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-purple-900 to-surface-dark p-6 rounded-xl border border-purple-500/20 text-white shadow-xl">
                            <span className="material-symbols-outlined text-4xl mb-4 text-purple-400">psychology</span>
                            <h3 className="text-xl font-bold mb-2">Construyendo Identidad</h3>
                            <p className="text-purple-200 text-sm leading-relaxed">
                                "Cada acción que realizas es un voto por el tipo de persona en la que deseas convertirte."
                            </p>
                            <p className="text-right text-xs mt-2 font-bold text-purple-400">- James Clear</p>
                        </div>


                    </div>
                </div>

                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-sm shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Nuevo Hábito</h2>
                            <form onSubmit={addHabit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    value={newHabit}
                                    onChange={(e) => setNewHabit(e.target.value)}
                                    placeholder="Nombre del hábito..."
                                    className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary"
                                    autoFocus
                                />
                                <div>
                                    <label className="text-sm font-bold text-text-secondary mb-2 block">Categoría</label>
                                    <div className="flex gap-2">
                                        {['Health', 'Mind', 'Work'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewCategory(cat as any)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${newCategory === cat ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-surface-dark-light text-text-secondary'}`}
                                            >
                                                {cat === 'Health' ? 'Salud' : cat === 'Mind' ? 'Mente' : 'Trabajo'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setIsAddOpen(false)} className="text-text-secondary font-bold px-4">Cancelar</button>
                                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Crear</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HabitsScreen;