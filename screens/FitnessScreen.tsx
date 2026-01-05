import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthContext';

interface Exercise {
    id: string;
    name: string;
    sets: WorkoutSet[];
}

interface WorkoutSet {
    id: number;
    weight: string;
    reps: string;
    rpe: string;
    completed: boolean;
}

interface Routine {
    id: string;
    name: string;
    defaultExercises?: string[]; // Simplified list for structure
}

interface WorkoutLog {
    id: number | string;
    date: string;
    timestamp: number;
    routineName: string;
    duration: number;
    feedback: string;
    exercises: Exercise[];
}

const FitnessScreen: React.FC = () => {
    const { user } = useAuth();

    // Persistent State for Routines
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loadingRoutines, setLoadingRoutines] = useState(true);

    // Persistent State for History
    const [history, setHistory] = useState<WorkoutLog[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Active Workout State
    const [activeWorkout, setActiveWorkout] = useState<{
        routineId: string;
        startTime: number;
        exercises: Exercise[];
    } | null>(null);

    // UI States
    const [activeTab, setActiveTab] = useState<'routines' | 'history'>('routines');
    const [finishModalOpen, setFinishModalOpen] = useState(false);
    const [workoutFeedback, setWorkoutFeedback] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Create Routine UI State
    const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
    const [newRoutineName, setNewRoutineName] = useState('');

    // Add Exercise during workout State
    const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');

    // Persistence Effects - Fetch Data
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            // Fetch Routines
            const { data: routinesData, error: routinesError } = await supabase
                .from('routines')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (routinesData) {
                // Map Supabase snake_case to component camelCase if needed, 
                // but here schema matches well enough except default_exercises
                const mappedRoutines = routinesData.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    defaultExercises: r.default_exercises
                }));
                setRoutines(mappedRoutines);
            }
            setLoadingRoutines(false);

            // Fetch History
            const { data: historyData, error: historyError } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (historyData) {
                const mappedHistory = historyData.map((h: any) => ({
                    id: h.id, // UUID
                    date: h.date,
                    timestamp: h.timestamp,
                    routineName: h.routine_name,
                    duration: h.duration,
                    feedback: h.feedback,
                    exercises: h.exercises
                }));
                setHistory(mappedHistory);
            }
            setLoadingHistory(false);
        };

        fetchData();
    }, [user]);

    // ---- ACTIONS ----

    const createRoutine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoutineName.trim() || !user) return;

        const newRoutine = {
            user_id: user.id,
            name: newRoutineName,
            default_exercises: []
        };

        const { data, error } = await supabase
            .from('routines')
            .insert([newRoutine])
            .select()
            .single();

        if (error) {
            alert('Error al crear rutina: ' + error.message);
        }

        if (data) {
            setRoutines([...routines, {
                id: data.id,
                name: data.name,
                defaultExercises: data.default_exercises
            }]);
            setNewRoutineName('');
            setIsCreateRoutineOpen(false);
        }
    };

    const deleteRoutine = async (id: string) => {
        // Confirmation ensures accidental clicks don't ruin data
        if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina permanentemente?')) {
            const { error } = await supabase.from('routines').delete().eq('id', id);
            if (!error) {
                setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== id));
            }
        }
    };

    const deleteLog = async (id: number | string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro del historial?')) {
            const { error } = await supabase.from('workout_logs').delete().eq('id', id);
            if (!error) {
                setHistory(history.filter(h => h.id !== id));
            }
        }
    };

    const startWorkout = (routine: Routine) => {
        const startingExercises: Exercise[] = (routine.defaultExercises || []).map(name => ({
            id: Math.random().toString(36).substr(2, 9),
            name: name,
            sets: [
                { id: Date.now(), weight: '', reps: '', rpe: '', completed: false },
                { id: Date.now() + 1, weight: '', reps: '', rpe: '', completed: false },
                { id: Date.now() + 2, weight: '', reps: '', rpe: '', completed: false }
            ]
        }));

        setActiveWorkout({
            routineId: routine.id,
            startTime: Date.now(),
            exercises: startingExercises
        });
    };

    const addExerciseToWorkout = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWorkout || !newExerciseName.trim()) return;

        const newExercise: Exercise = {
            id: Math.random().toString(36).substr(2, 9),
            name: newExerciseName,
            sets: [
                { id: Date.now(), weight: '', reps: '', rpe: '', completed: false },
                { id: Date.now() + 1, weight: '', reps: '', rpe: '', completed: false },
                { id: Date.now() + 2, weight: '', reps: '', rpe: '', completed: false }
            ]
        };

        setActiveWorkout({
            ...activeWorkout,
            exercises: [...activeWorkout.exercises, newExercise]
        });
        setNewExerciseName('');
        setIsAddExerciseOpen(false);
    };

    const updateSet = (exerciseId: string, setId: number, field: keyof WorkoutSet, value: string | boolean) => {
        if (!activeWorkout) return;
        const updatedExercises = activeWorkout.exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
                };
            }
            return ex;
        });
        setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
    };

    const addSet = (exerciseId: string) => {
        if (!activeWorkout) return;
        const updatedExercises = activeWorkout.exercises.map(ex => {
            if (ex.id === exerciseId) {
                return {
                    ...ex,
                    sets: [...ex.sets, { id: Date.now(), weight: '', reps: '', rpe: '', completed: false }]
                };
            }
            return ex;
        });
        setActiveWorkout({ ...activeWorkout, exercises: updatedExercises });
    };

    const finishWorkout = async () => {
        if (!activeWorkout || !user) return;

        const routineName = routines.find(r => r.id === activeWorkout.routineId)?.name || 'Rutina Personalizada';
        const exerciseNames = activeWorkout.exercises.map(e => e.name);

        // 1. Save to History (Supabase)
        const logData = {
            user_id: user.id,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            routine_name: routineName,
            duration: Math.floor((Date.now() - activeWorkout.startTime) / 60000),
            feedback: workoutFeedback,
            exercises: activeWorkout.exercises
        };

        const { data: savedLog, error: logError } = await supabase
            .from('workout_logs')
            .insert([logData])
            .select()
            .single();

        if (savedLog) {
            setHistory([{
                id: savedLog.id,
                date: savedLog.date,
                timestamp: savedLog.timestamp,
                routineName: savedLog.routine_name,
                duration: savedLog.duration,
                feedback: savedLog.feedback,
                exercises: savedLog.exercises
            }, ...history]);
        }

        // 2. Update Routine Default Exercises (Persistence for next time)
        // We only update if the routine exists (it might have been deleted)
        // And we update strictly the default_exercises
        const currentRoutine = routines.find(r => r.id === activeWorkout.routineId);
        if (currentRoutine) {
            const { error: updateError } = await supabase
                .from('routines')
                .update({ default_exercises: exerciseNames })
                .eq('id', activeWorkout.routineId);

            if (!updateError) {
                setRoutines(routines.map(r => {
                    if (r.id === activeWorkout.routineId) {
                        return { ...r, defaultExercises: exerciseNames };
                    }
                    return r;
                }));
            }
        }

        // Reset UI
        setActiveWorkout(null);
        setFinishModalOpen(false);
        setWorkoutFeedback('');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex font-display">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto flex flex-col relative">
                {activeWorkout ? (
                    // ---- ACTIVE WORKOUT VIEW ----
                    <div className="max-w-[800px] w-full mx-auto p-4 md:p-6 pb-32">
                        <header className="flex justify-between items-center mb-6 sticky top-0 bg-background-light dark:bg-background-dark z-20 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-primary">
                                    <span className="material-symbols-outlined">menu</span>
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-primary">Entrenamiento en Curso</h2>
                                    <p className="text-sm text-text-secondary">
                                        {routines.find(r => r.id === activeWorkout.routineId)?.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFinishModalOpen(true)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold shadow-lg text-sm md:text-base"
                            >
                                Finalizar
                            </button>
                        </header>

                        <div className="flex flex-col gap-6">
                            {activeWorkout.exercises.length === 0 && (
                                <div className="text-center py-10 text-text-secondary border-2 border-dashed border-slate-200 dark:border-surface-dark-light rounded-xl">
                                    <p>Esta rutina está vacía.</p>
                                    <p className="text-sm">Añade ejercicios para empezar a construirla.</p>
                                </div>
                            )}

                            {activeWorkout.exercises.map(exercise => (
                                <div key={exercise.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-4 md:p-6 shadow-sm">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">fitness_center</span>
                                        {exercise.name}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-10 gap-2 text-xs text-text-secondary uppercase font-bold text-center mb-1">
                                            <div className="col-span-1">Set</div>
                                            <div className="col-span-3">Peso (kg)</div>
                                            <div className="col-span-3">Reps</div>
                                            <div className="col-span-2">RPE</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {exercise.sets.map((set, index) => (
                                            <div key={set.id} className={`grid grid-cols-10 gap-2 items-center ${set.completed ? 'opacity-50' : ''}`}>
                                                <div className="col-span-1 flex justify-center">
                                                    <div className="size-6 rounded-full bg-slate-100 dark:bg-surface-dark-light flex items-center justify-center text-xs font-bold text-text-secondary">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={set.weight}
                                                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded p-2 text-center focus:ring-1 focus:ring-primary text-sm md:text-base"
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={set.reps}
                                                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded p-2 text-center focus:ring-1 focus:ring-primary text-sm md:text-base"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        placeholder="-"
                                                        value={set.rpe}
                                                        onChange={(e) => updateSet(exercise.id, set.id, 'rpe', e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded p-2 text-center focus:ring-1 focus:ring-primary text-sm md:text-base"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button
                                                        onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                                                        className={`size-8 rounded flex items-center justify-center transition-colors ${set.completed ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-surface-dark-light text-slate-400 hover:bg-slate-300'}`}
                                                    >
                                                        <span className="material-symbols-outlined text-lg">check</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addSet(exercise.id)}
                                            className="mt-2 text-sm text-primary hover:underline flex items-center gap-1 justify-center w-full py-2 bg-primary/5 rounded border border-dashed border-primary/20 hover:border-primary/50"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Añadir Serie
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setIsAddExerciseOpen(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-text-secondary hover:text-primary hover:border-primary transition-colors font-bold flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Añadir Ejercicio a la Rutina
                            </button>
                        </div>
                    </div>
                ) : (
                    // ---- DASHBOARD VIEW ----
                    <div className="max-w-[1200px] w-full mx-auto p-4 md:p-6 flex flex-col gap-8 pb-20">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-primary">
                                    <span className="material-symbols-outlined text-2xl">menu</span>
                                </button>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black mb-1">Fitness Tracker</h1>
                                    <p className="text-text-secondary text-sm md:text-base">Gestiona tus rutinas y visualiza tu progreso.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 bg-surface-dark-light/50 p-1 rounded-lg w-full md:w-auto">
                                <button
                                    onClick={() => setActiveTab('routines')}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'routines' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                                >
                                    Rutinas
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                                >
                                    Historial
                                </button>
                            </div>
                        </header>

                        {activeTab === 'routines' ? (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <button
                                        onClick={() => setIsCreateRoutineOpen(true)}
                                        className="bg-white dark:bg-surface-dark rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center gap-2 text-text-secondary hover:text-primary hover:border-primary transition-all group h-48"
                                    >
                                        <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                                        <span className="font-bold">Crear Nueva Rutina</span>
                                    </button>

                                    {routines.map(routine => (
                                        <div
                                            key={routine.id}
                                            className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 hover:border-primary transition-colors group relative overflow-hidden flex flex-col justify-between h-48"
                                        // REMOVED onClick from here to separate layers
                                        >
                                            {/* Layer 1: Background Click Area (Start Workout) */}
                                            <div
                                                className="absolute inset-0 z-0 cursor-pointer"
                                                onClick={() => startWorkout(routine)}
                                            ></div>

                                            {/* Decorative Icon */}
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                <span className="material-symbols-outlined text-8xl">fitness_center</span>
                                            </div>

                                            {/* Layer 2: Content (Pointer events none so clicks pass through to layer 1) */}
                                            <div className="flex justify-between items-start z-10 relative pointer-events-none">
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-2">{routine.name}</h3>
                                                    <p className="text-sm text-text-secondary">
                                                        {routine.defaultExercises && routine.defaultExercises.length > 0
                                                            ? `${routine.defaultExercises.length} ejercicios`
                                                            : 'Sin ejercicios guardados'}
                                                    </p>
                                                </div>

                                                {/* Layer 3: Delete Button (Pointer events auto to capture clicks) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteRoutine(routine.id);
                                                    }}
                                                    className="pointer-events-auto text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors p-2 rounded-lg z-20 relative"
                                                    title="Eliminar Rutina"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>

                                            {/* Layer 4: Train Button (Pointer events auto) */}
                                            <button
                                                className="pointer-events-auto w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 z-10 relative"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startWorkout(routine);
                                                }}
                                            >
                                                <span className="material-symbols-outlined">play_arrow</span>
                                                Entrenar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 animate-fade-in">
                                {history.length === 0 ? (
                                    <div className="text-center py-20 text-text-secondary">
                                        <span className="material-symbols-outlined text-4xl mb-2">history</span>
                                        <p>No hay entrenamientos registrados.</p>
                                    </div>
                                ) : (
                                    history.map((log) => (
                                        <div key={log.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6">
                                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold">{log.routineName}</h3>
                                                    <p className="text-sm text-text-secondary">{log.date} • {log.duration} min</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {log.feedback && (
                                                        <div className="bg-slate-50 dark:bg-background-dark p-2 rounded text-sm italic text-text-secondary max-w-sm hidden md:block">
                                                            "{log.feedback}"
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => deleteLog(log.id)}
                                                        className="text-text-secondary hover:text-red-500 transition-colors"
                                                        title="Eliminar Registro"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {log.exercises.map(ex => (
                                                    <div key={ex.id} className="bg-slate-50 dark:bg-surface-dark-light/30 rounded p-3">
                                                        <p className="font-bold text-sm mb-2">{ex.name}</p>
                                                        <div className="space-y-1">
                                                            {ex.sets.filter(s => s.completed).map((s, i) => (
                                                                <div key={s.id} className="text-xs text-text-secondary flex justify-between">
                                                                    <span>Serie {i + 1}</span>
                                                                    <span className="text-slate-900 dark:text-white font-mono">{s.weight}kg x {s.reps}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- MODALS --- */}
                {/* ... (Modals remain mostly the same, minor responsiveness adjustments handled by CSS) ... */}
                {finishModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-md shadow-2xl">
                            <h2 className="text-2xl font-bold mb-4">¡Sesión Terminada!</h2>
                            <p className="text-text-secondary mb-4">¿Notas para la próxima vez?</p>
                            <textarea
                                value={workoutFeedback}
                                onChange={(e) => setWorkoutFeedback(e.target.value)}
                                className="w-full h-32 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg p-3 mb-6 focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Ej: Subir peso en banca..."
                            ></textarea>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFinishModalOpen(false)}
                                    className="flex-1 py-3 text-text-secondary hover:text-white font-bold"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={finishWorkout}
                                    className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isCreateRoutineOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-sm shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Nueva Rutina</h2>
                            <form onSubmit={createRoutine} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-bold text-text-secondary mb-1 block">Nombre de la Rutina</label>
                                    <input
                                        type="text"
                                        value={newRoutineName}
                                        onChange={(e) => setNewRoutineName(e.target.value)}
                                        placeholder="Ej: Pierna Hipertrofia"
                                        className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-2">
                                    <button type="button" onClick={() => setIsCreateRoutineOpen(false)} className="text-text-secondary font-bold px-4">Cancelar</button>
                                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Crear</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {isAddExerciseOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-sm shadow-2xl">
                            <h2 className="text-xl font-bold mb-4">Añadir Ejercicio</h2>
                            <form onSubmit={addExerciseToWorkout} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-bold text-text-secondary mb-1 block">Nombre del Ejercicio</label>
                                    <input
                                        type="text"
                                        value={newExerciseName}
                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                        placeholder="Ej: Press Militar"
                                        className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-2">
                                    <button type="button" onClick={() => setIsAddExerciseOpen(false)} className="text-text-secondary font-bold px-4">Cancelar</button>
                                    <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Añadir</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FitnessScreen;