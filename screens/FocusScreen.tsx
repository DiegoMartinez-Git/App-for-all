import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthContext';

interface Task {
    id: string;
    title: string;
    description: string;
    category: 'Work' | 'Personal' | 'Study' | 'Fitness' | 'Other';
    priority: 'High' | 'Medium' | 'Low';
    completed: boolean;
}

const FocusScreen: React.FC = () => {
    const { user } = useAuth();
    // Focus Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Tasks State
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Add Task Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState<'Work' | 'Personal' | 'Study' | 'Fitness' | 'Other'>('Work');
    const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    useEffect(() => {
        if (!user) return;
        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .eq('completed', false)
                .order('created_at', { ascending: true });

            if (data) {
                setTasks(data);
            }
            setIsLoading(false);
        };
        fetchTasks();
    }, [user]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle || !user) return;

        const newTaskObj = {
            user_id: user.id,
            title: newTaskTitle,
            description: newTaskDescription,
            category: newTaskCategory,
            priority: newTaskPriority,
            completed: false
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTaskObj])
            .select()
            .single();

        if (error) {
            alert('Error al crear tarea: ' + error.message);
        }

        if (data) {
            setTasks([...tasks, data]);
            setNewTaskTitle('');
            setNewTaskDescription('');
            setNewTaskCategory('Work');
            setNewTaskPriority('Medium');
            setIsAddOpen(false);
        }
    };

    const toggleTask = async (id: string) => {
        // Optimistic update: Remove from list immediately
        const taskToUpdate = tasks.find(t => t.id === id);
        if (!taskToUpdate) return;

        // Remove from UI immediately to satisfy "completed tasks should disappear"
        setTasks(tasks.filter(t => t.id !== id));

        const { error } = await supabase
            .from('tasks')
            .update({ completed: true })
            .eq('id', id);

        if (error) {
            // Revert if error
            console.error('Error completing task:', error);
            setTasks([...tasks, taskToUpdate]);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex font-display">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">
                <header className="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md border-b border-surface-dark-light px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-text-secondary"><span className="material-symbols-outlined">menu</span></button>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">center_focus_strong</span>
                            Zona de Enfoque
                        </h2>
                    </div>
                </header>

                <div className="max-w-[1200px] w-full mx-auto p-6 flex flex-col gap-6 pb-20">
                    {/* Timer Section */}
                    <div className="bg-surface-dark rounded-xl border border-surface-dark-light overflow-hidden shadow-xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex flex-col gap-2 text-center md:text-left">
                                <span className="text-primary font-bold tracking-wider text-sm uppercase">Sesión de Deep Work</span>
                                <h1 className="text-4xl md:text-5xl font-black text-white">
                                    {isTimerRunning ? 'Mantén el foco.' : 'Listo para empezar.'}
                                </h1>
                                <p className="text-text-secondary max-w-md">Bloquea distracciones. Una tarea a la vez.</p>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className={`text-6xl md:text-8xl font-mono font-bold tracking-tighter transition-colors ${isTimerRunning ? 'text-primary' : 'text-slate-700 dark:text-slate-600'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={toggleTimer}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${isTimerRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary-hover text-white'}`}
                                    >
                                        <span className="material-symbols-outlined">{isTimerRunning ? 'pause' : 'play_arrow'}</span>
                                        {isTimerRunning ? 'Pausar' : 'Iniciar'}
                                    </button>
                                    <button
                                        onClick={() => { setIsTimerRunning(false); setTimeLeft(25 * 60); }}
                                        className="size-12 rounded-full bg-surface-dark-light flex items-center justify-center text-text-secondary hover:text-white hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Queue and Image Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-500">priority_high</span>
                                Prioridades del Día
                            </h3>

                            <div className="flex flex-col gap-3 min-h-[200px]">
                                {isLoading ? (
                                    <div className="text-center py-10 text-text-secondary">Cargando tareas...</div>
                                ) : tasks.length === 0 ? (
                                    <div className="text-center py-10 flex flex-col items-center gap-2 border-2 border-dashed border-slate-200 dark:border-surface-dark-light rounded-lg">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">task_alt</span>
                                        <p className="text-text-secondary font-medium">No tienes tareas pendientes.</p>
                                        <p className="text-xs text-text-secondary">¡Añade una para empezar!</p>
                                    </div>
                                ) : (
                                    tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="p-4 rounded-lg bg-white dark:bg-surface-dark-light/50 border border-slate-200 dark:border-surface-dark-light hover:border-primary/50 transition-all flex items-start gap-4 group"
                                        >
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className="mt-1 size-5 rounded-full border-2 border-slate-400 group-hover:border-primary flex items-center justify-center transition-colors"
                                            >
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getPriorityColor(task.priority)}`}>
                                                        {task.priority === 'High' ? 'Alta' : task.priority === 'Medium' ? 'Media' : 'Baja'}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-text-secondary bg-slate-100 dark:bg-surface-dark px-2 py-0.5 rounded">
                                                        {task.category === 'Work' ? 'Trabajo' :
                                                            task.category === 'Study' ? 'Estudio' :
                                                                task.category === 'Personal' ? 'Personal' :
                                                                    task.category === 'Fitness' ? 'Fitness' : 'Otro'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => setIsAddOpen(true)}
                                className="mt-4 w-full py-3 bg-surface-dark-light hover:bg-primary hover:text-white text-text-secondary rounded-lg transition-colors flex items-center justify-center gap-2 font-bold"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Añadir Nueva Tarea
                            </button>
                        </div>

                        <div className="rounded-xl border border-slate-200 dark:border-surface-dark-light overflow-hidden h-full min-h-[300px] relative group">
                            <img
                                src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80"
                                alt="Vision Board 2026"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold">Visión 2026</h3>
                                    <p className="text-sm opacity-90">Mantén tus metas a la vista.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isAddOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
                            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Nueva Tarea</h2>
                            <form onSubmit={addTask} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-bold text-text-secondary mb-1 block">Título</label>
                                    <input
                                        type="text"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="¿Qué necesitas enfocar?"
                                        className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-text-secondary mb-1 block">Descripción (Opcional)</label>
                                    <textarea
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                        placeholder="Detalles adicionales..."
                                        rows={3}
                                        className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-text-secondary mb-1 block">Categoría</label>
                                        <select
                                            value={newTaskCategory}
                                            onChange={(e) => setNewTaskCategory(e.target.value as any)}
                                            className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white appearance-none"
                                        >
                                            <option value="Work">Trabajo</option>
                                            <option value="Study">Estudio</option>
                                            <option value="Personal">Personal</option>
                                            <option value="Fitness">Fitness</option>
                                            <option value="Other">Otro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-text-secondary mb-1 block">Prioridad</label>
                                        <select
                                            value={newTaskPriority}
                                            onChange={(e) => setNewTaskPriority(e.target.value as any)}
                                            className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white appearance-none"
                                        >
                                            <option value="High">Alta</option>
                                            <option value="Medium">Media</option>
                                            <option value="Low">Baja</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddOpen(false)}
                                        className="text-text-secondary font-bold px-4 py-2 hover:bg-slate-100 dark:hover:bg-surface-dark-light rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Crear Tarea
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FocusScreen;