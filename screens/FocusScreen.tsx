import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const FocusScreen: React.FC = () => {
    // Focus Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    
    // Tasks State
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Estudio de Arquitectura de Sistemas', tag: 'High Priority', completed: false },
        { id: 2, title: 'Revisión de PR #402', tag: 'Dev', completed: false },
        { id: 3, title: 'Responder correos pendientes', tag: 'Admin', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
    
    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newTask) return;
        setTasks([...tasks, { id: Date.now(), title: newTask, tag: 'General', completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
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
                            <div className="flex flex-col gap-3">
                                {tasks.map(task => (
                                    <div 
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center gap-4 group ${task.completed ? 'bg-slate-50 dark:bg-surface-dark-light/30 border-transparent opacity-60' : 'bg-white dark:bg-surface-dark-light/50 border-slate-200 dark:border-surface-dark-light hover:border-primary/50'}`}
                                    >
                                        <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'border-primary bg-primary' : 'border-slate-400 group-hover:border-primary'}`}>
                                            {task.completed && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${task.completed ? 'line-through text-text-secondary' : 'text-slate-900 dark:text-white'}`}>{task.title}</p>
                                            <span className="text-xs text-text-secondary bg-slate-100 dark:bg-surface-dark px-2 py-0.5 rounded mt-1 inline-block">{task.tag}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={addTask} className="mt-4 flex gap-2">
                                <input 
                                    type="text" 
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    placeholder="Añadir nueva tarea..."
                                    className="flex-1 bg-slate-100 dark:bg-surface-dark-light border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                />
                                <button type="submit" className="bg-surface-dark-light hover:bg-primary hover:text-white text-text-secondary rounded-lg px-4 transition-colors">
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </form>
                        </div>
                        
                        <div className="rounded-xl border border-slate-200 dark:border-surface-dark-light overflow-hidden h-full min-h-[300px] relative group">
                            <img 
                                src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80" 
                                alt="Vision Board 2026"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* NOTE: Replace the src above with your specific image URL if you have one hosted online. */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 className="text-2xl font-bold">Visión 2026</h3>
                                    <p className="text-sm opacity-90">Mantén tus metas a la vista.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FocusScreen;