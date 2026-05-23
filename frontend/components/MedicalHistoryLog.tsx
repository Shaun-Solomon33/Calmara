import React, { useState } from 'react';
import type { MedicalHistoryEntry } from '../types';
import TrashIcon from './icons/TrashIcon';

interface MedicalHistoryLogProps {
    history: MedicalHistoryEntry[];
    setHistory: React.Dispatch<React.SetStateAction<MedicalHistoryEntry[]>>;
}

const MedicalHistoryLog: React.FC<MedicalHistoryLogProps> = ({ history, setHistory }) => {
    const [note, setNote] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || !date) return;
        const newEntry: MedicalHistoryEntry = {
            id: Date.now().toString(),
            date,
            note,
        };
        setHistory(prev => [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setNote('');
    };
    
    const handleDeleteEntry = (id: string) => {
        setHistory(prev => prev.filter(entry => entry.id !== id));
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Add New History Entry</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Keep track of appointments, medication changes, or important notes.</p>
                <form onSubmit={handleAddEntry} className="space-y-4">
                    <div>
                         <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                         <input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                         />
                    </div>
                    <div>
                         <label htmlFor="note" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Note</label>
                        <textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Annual check-up with Dr. Smith. Discussed sensory-friendly vaccination options."
                            required
                        />
                    </div>
                     <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-purple-800 dark:text-purple-100 bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            Add Entry
                        </button>
                    </div>
                </form>
            </div>
            
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Your Medical History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {history.length > 0 ? (
                        history.map(entry => (
                            <div key={entry.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-start gap-4">
                               <div>
                                    <p className="font-semibold text-purple-700 dark:text-purple-400">{new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                                    <p className="text-slate-600 dark:text-slate-300">{entry.note}</p>
                               </div>
                                <button onClick={() => handleDeleteEntry(entry.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" aria-label="Delete entry">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">No history entries yet. Add one above to get started.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalHistoryLog;
