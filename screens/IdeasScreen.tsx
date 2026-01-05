import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

interface Idea {
    id: number;
    title: string;
    description: string;
    date: string;
}

const IdeasScreen: React.FC = () => {
    // Persistent State for Ideas
    const [ideas, setIdeas] = useState<Idea[]>(() => {
        const saved = localStorage.getItem('allfordev_ideas');
        return saved ? JSON.parse(saved) : [];
    });

    const [isAddIdeaOpen, setIsAddIdeaOpen] = useState(false);
    const [newIdeaTitle, setNewIdeaTitle] = useState('');
    const [newIdeaDescription, setNewIdeaDescription] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('allfordev_ideas', JSON.stringify(ideas));
    }, [ideas]);

    const addIdea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIdeaTitle.trim()) return;

        const newIdea: Idea = {
            id: Date.now(),
            title: newIdeaTitle,
            description: newIdeaDescription,
            date: new Date().toLocaleDateString()
        };

        setIdeas([newIdea, ...ideas]);
        setNewIdeaTitle('');
        setNewIdeaDescription('');
        setIsAddIdeaOpen(false);
    };

    const deleteIdea = (id: number) => {
        if (window.confirm('¿Eliminar esta idea?')) {
            setIdeas(ideas.filter(i => i.id !== id));
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex font-display">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 h-screen overflow-y-auto p-4 md:p-10 relative">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                         <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-primary">
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1">Ideas de Negocio</h1>
                            <p className="text-text-secondary text-sm md:text-base">Captura y desarrolla tus próximos proyectos.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsAddIdeaOpen(true)}
                        className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nueva Idea
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-text-secondary border-2 border-dashed border-slate-200 dark:border-surface-dark-light rounded-2xl">
                            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">lightbulb</span>
                            <p className="text-xl font-medium">No hay ideas registradas.</p>
                            <p className="text-sm mt-2">Empieza a escribir tus pensamientos innovadores.</p>
                        </div>
                    ) : (
                        ideas.map(idea => (
                            <div key={idea.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 hover:border-primary/50 transition-all group flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded-lg">
                                        <span className="material-symbols-outlined">lightbulb</span>
                                    </div>
                                    <span className="text-xs text-text-secondary">{idea.date}</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 break-words">{idea.title}</h3>
                                <p className="text-text-secondary text-sm whitespace-pre-wrap flex-1 mb-4 break-words">{idea.description}</p>
                                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-surface-dark-light mt-auto">
                                    <button 
                                        onClick={() => deleteIdea(idea.id)}
                                        className="text-text-secondary hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Add Idea */}
                {isAddIdeaOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-lg shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">lightbulb</span>
                                Nueva Idea de Negocio
                            </h2>
                            <form onSubmit={addIdea} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">Título de la Idea</label>
                                    <input 
                                        type="text" 
                                        value={newIdeaTitle}
                                        onChange={(e) => setNewIdeaTitle(e.target.value)}
                                        placeholder="Ej: SaaS para gestión de gimnasios..."
                                        className="w-full bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary font-bold text-lg"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-secondary mb-1">Descripción / Detalles</label>
                                    <textarea 
                                        value={newIdeaDescription}
                                        onChange={(e) => setNewIdeaDescription(e.target.value)}
                                        placeholder="Describe el problema, la solución, monetización..."
                                        className="w-full h-40 bg-slate-100 dark:bg-background-dark border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddIdeaOpen(false)}
                                        className="text-text-secondary font-bold px-4 py-2 hover:text-white transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-primary/20"
                                    >
                                        Guardar Idea
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

export default IdeasScreen;