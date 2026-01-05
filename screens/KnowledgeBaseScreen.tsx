import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/context/AuthContext';

interface Book {
    id: string; // Changed to string for UUID
    title: string;
    author: string;
    status: 'read' | 'reading' | 'toread';
    rating?: number;
}

interface Note {
    id: string; // Changed to string for UUID
    title: string;
    content: string;
    date: string;
}

const KnowledgeBaseScreen: React.FC = () => {
    const { user } = useAuth();

    // Books State
    const [books, setBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);

    // Notes State
    const [notes, setNotes] = useState<Note[]>([]);
    const [loadingNotes, setLoadingNotes] = useState(true);

    const [activeTab, setActiveTab] = useState<'library' | 'notes'>('library');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Modals State
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

    // Form State
    const [newBook, setNewBook] = useState({ title: '', author: '' });
    const [newNote, setNewNote] = useState({ title: '', content: '' });

    // Persistence Effect
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            // Fetch Books
            const { data: booksData } = await supabase
                .from('books')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (booksData) {
                setBooks(booksData as Book[]);
            }
            setLoadingBooks(false);

            // Fetch Notes
            const { data: notesData } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (notesData) {
                setNotes(notesData as Note[]);
            }
            setLoadingNotes(false);
        };

        fetchData();
    }, [user]);

    // Book Handlers
    const handleAddBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBook.title || !newBook.author || !user) {
            alert('Por favor, completa el título y el autor.');
            return;
        }

        const bookData = {
            user_id: user.id,
            title: newBook.title,
            author: newBook.author,
            status: 'toread',
            rating: 0
        };

        const { data, error } = await supabase.from('books').insert([bookData]).select().single();

        if (error) {
            alert('Error al agregar libro: ' + error.message);
        }

        if (data) {
            setBooks([data as Book, ...books]);
            setNewBook({ title: '', author: '' });
            setIsAddBookModalOpen(false);
        }
    };

    const toggleStatus = async (id: string) => {
        const book = books.find(b => b.id === id);
        if (!book) return;

        const nextStatus = book.status === 'toread' ? 'reading' : book.status === 'reading' ? 'read' : 'toread';

        // Optimistic
        setBooks(books.map(b => b.id === id ? { ...b, status: nextStatus } : b));

        await supabase.from('books').update({ status: nextStatus }).eq('id', id);
    };

    const deleteBook = async (id: string) => {
        if (window.confirm('¿Eliminar este libro?')) {
            const { error } = await supabase.from('books').delete().eq('id', id);
            if (!error) {
                setBooks(books.filter(b => b.id !== id));
            }
        }
    };

    // Note Handlers
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.title || !newNote.content || !user) {
            alert('Por favor, completa el título y el contenido.');
            return;
        }

        const noteData = {
            user_id: user.id,
            title: newNote.title,
            content: newNote.content,
            date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
        };

        const { data, error } = await supabase.from('notes').insert([noteData]).select().single();

        if (error) {
            alert('Error al agregar nota: ' + error.message);
        }

        if (data) {
            setNotes([data as Note, ...notes]);
            setNewNote({ title: '', content: '' });
            setIsAddNoteModalOpen(false);
        }
    };

    const deleteNote = async (id: string) => {
        if (window.confirm('¿Eliminar esta nota?')) {
            const { error } = await supabase.from('notes').delete().eq('id', id);
            if (!error) {
                setNotes(notes.filter(n => n.id !== id));
            }
        }
    };

    // UI Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'read': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'reading': return 'bg-primary/20 text-primary border-primary/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'read': return 'Leído';
            case 'reading': return 'Leyendo';
            default: return 'Por leer';
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased h-screen overflow-hidden flex">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative p-4 md:p-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-primary">
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black mb-1">Base de Conocimiento</h1>
                            <p className="text-text-secondary text-sm md:text-base">Gestiona tus recursos de aprendizaje y lecturas.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 bg-surface-dark-light/50 p-1 rounded-lg w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'library' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                        >
                            Biblioteca
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'notes' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                        >
                            Notas
                        </button>
                    </div>
                </header>

                {activeTab === 'library' && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="flex-1 md:flex-none bg-surface-dark p-4 rounded-xl border border-surface-dark-light">
                                    <p className="text-xs text-text-secondary uppercase">Libros Leídos</p>
                                    <p className="text-2xl font-bold">{books.filter(b => b.status === 'read').length}</p>
                                </div>
                                <div className="flex-1 md:flex-none bg-surface-dark p-4 rounded-xl border border-surface-dark-light">
                                    <p className="text-xs text-text-secondary uppercase">Por Leer</p>
                                    <p className="text-2xl font-bold">{books.filter(b => b.status === 'toread').length}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddBookModalOpen(true)}
                                className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Agregar Libro
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {books.map(book => (
                                <div key={book.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-5 flex flex-col gap-4 group hover:border-primary/50 transition-all shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="size-12 rounded bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xl">
                                            {book.title.charAt(0)}
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={() => deleteBook(book.id)}
                                                className="text-text-secondary hover:text-red-400 p-1 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{book.title}</h3>
                                        <p className="text-sm text-text-secondary">{book.author}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-surface-dark-light">
                                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(book.status)} font-medium uppercase tracking-wider`}>
                                            {getStatusLabel(book.status)}
                                        </span>
                                        <button
                                            onClick={() => toggleStatus(book.id)}
                                            className="text-text-secondary hover:text-white text-xs font-medium hover:underline"
                                        >
                                            Cambiar Estado
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <p className="text-text-secondary">Captura tus ideas y aprendizajes clave.</p>
                            <button
                                onClick={() => setIsAddNoteModalOpen(true)}
                                className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                                Agregar Nota
                            </button>
                        </div>

                        {notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-text-secondary border-2 border-dashed border-slate-200 dark:border-surface-dark-light rounded-2xl">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">description</span>
                                <p>No tienes notas guardadas.</p>
                                <button onClick={() => setIsAddNoteModalOpen(true)} className="text-primary hover:underline mt-2">Crear primera nota</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.map(note => (
                                    <div key={note.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 flex flex-col gap-4 group hover:border-primary/50 transition-all shadow-sm h-full">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs text-text-secondary bg-slate-100 dark:bg-surface-dark-light px-2 py-1 rounded">{note.date}</span>
                                            <button onClick={() => deleteNote(note.id)} className="text-text-secondary hover:text-red-400 transition-colors md:opacity-0 group-hover:opacity-100">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">{note.title}</h3>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Add Book Modal */}
            {isAddBookModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Agregar Nuevo Libro</h2>
                        <form onSubmit={handleAddBook} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
                                <input
                                    type="text"
                                    value={newBook.title}
                                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                    placeholder="Ej. Thinking in Systems"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Autor</label>
                                <input
                                    type="text"
                                    value={newBook.author}
                                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                    placeholder="Ej. Donella Meadows"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddBookModalOpen(false)}
                                    className="px-4 py-2 text-text-secondary hover:text-slate-900 dark:hover:text-white font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary/25"
                                >
                                    Guardar Libro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Note Modal */}
            {isAddNoteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-surface-dark-light p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Crear Nueva Nota</h2>
                        <form onSubmit={handleAddNote} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Título</label>
                                <input
                                    type="text"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                                    placeholder="Idea principal..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Contenido</label>
                                <textarea
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    className="w-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-surface-dark-light rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary h-32 text-slate-900 dark:text-white resize-none"
                                    placeholder="Escribe tus pensamientos aquí..."
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddNoteModalOpen(false)}
                                    className="px-4 py-2 text-text-secondary hover:text-slate-900 dark:hover:text-white font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-primary/25"
                                >
                                    Guardar Nota
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBaseScreen;