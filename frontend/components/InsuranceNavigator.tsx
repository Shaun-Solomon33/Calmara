import React, { useState, useEffect } from 'react';
import type { InsuranceItem } from '../types';
import { simplifyInsuranceJargon, generateAppealLetter } from '../services/geminiService';
import TrashIcon from './icons/TrashIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';

const InsuranceNavigator: React.FC = () => {
    const [items, setItems] = useState<InsuranceItem[]>(() => {
        const saved = localStorage.getItem('calmara-insuranceItems');
        return saved ? JSON.parse(saved) : [];
    });

    const [newItem, setNewItem] = useState({
        type: 'Claim' as InsuranceItem['type'],
        serviceName: '',
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: 'Pending' as InsuranceItem['status'],
        notes: '',
    });

    const [jargon, setJargon] = useState('');
    const [simplification, setSimplification] = useState({ text: '', error: '' });
    const [isSimplifying, setIsSimplifying] = useState(false);
    
    const [appeal, setAppeal] = useState({ item: null as InsuranceItem | null, letter: '', error: '', isLoading: false });


    useEffect(() => {
        localStorage.setItem('calmara-insuranceItems', JSON.stringify(items));
    }, [items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.serviceName.trim()) return;
        const itemToAdd: InsuranceItem = { ...newItem, id: Date.now().toString() };
        setItems(prev => [itemToAdd, ...prev].sort((a,b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()));
        // Reset form
        setNewItem({
            type: 'Claim',
            serviceName: '',
            dateSubmitted: new Date().toISOString().split('T')[0],
            status: 'Pending',
            notes: '',
        });
    };

    const handleDeleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };
    
    const handleUpdateStatus = (id: string, status: InsuranceItem['status']) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    };

    const handleSimplify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jargon.trim()) return;
        setIsSimplifying(true);
        setSimplification({ text: '', error: '' });
        try {
            const result = await simplifyInsuranceJargon(jargon);
            setSimplification({ text: result, error: '' });
        } catch (err) {
            setSimplification({ text: '', error: err instanceof Error ? err.message : 'An unknown error occurred' });
        } finally {
            setIsSimplifying(false);
        }
    };
    
    const handleGenerateAppeal = async (item: InsuranceItem) => {
        setAppeal({ item, letter: '', error: '', isLoading: true });
        try {
            const result = await generateAppealLetter(item);
            setAppeal({ item, letter: result, error: '', isLoading: false });
        } catch (err) {
             setAppeal({ item, letter: '', error: err instanceof Error ? err.message : 'An unknown error occurred', isLoading: false });
        }
    };
    
    const getStatusColor = (status: InsuranceItem['status']) => {
        switch(status) {
            case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Denied': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };
    
    const AppealModal = () => {
        if (!appeal.item) return null;

        const handleCopy = () => {
            navigator.clipboard.writeText(appeal.letter);
        };

        return (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg w-full max-w-2xl p-8 max-h-[90vh] flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Appeal Letter Draft</h3>
                    {appeal.isLoading && <p className="text-slate-600 dark:text-slate-300">Generating your letter...</p>}
                    {appeal.error && <p className="text-red-600 dark:text-red-300">{appeal.error}</p>}
                    {appeal.letter && (
                        <div className="flex-grow overflow-y-auto pr-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-sm">{appeal.letter}</pre>
                        </div>
                    )}
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setAppeal({ item: null, letter: '', error: '', isLoading: false })} className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">Close</button>
                        {appeal.letter && (
                             <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-700 hover:bg-amber-300 dark:hover:bg-amber-600">
                                <ClipboardIcon className="h-4 w-4" />
                                Copy to Clipboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <AppealModal />
            {/* Tracker */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Insurance Tracker</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Log and manage your claims, authorizations, and appeals.</p>
                <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="serviceName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Service/Procedure Name</label>
                            <input id="serviceName" name="serviceName" type="text" value={newItem.serviceName} onChange={handleInputChange} required placeholder="e.g., ABA Therapy Session" className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div>
                            <label htmlFor="dateSubmitted" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Date Submitted</label>
                            <input id="dateSubmitted" name="dateSubmitted" type="date" value={newItem.dateSubmitted} onChange={handleInputChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Item Type</label>
                            <select id="type" name="type" value={newItem.type} onChange={handleInputChange} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option>Claim</option>
                                <option>Prior Authorization</option>
                                <option>Appeal</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Initial Status</label>
                            <select id="status" name="status" value={newItem.status} onChange={handleInputChange} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                                <option>Pending</option>
                                <option>Approved</option>
                                <option>Denied</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Notes (Optional)</label>
                        <textarea id="notes" name="notes" value={newItem.notes} onChange={handleInputChange} rows={3} placeholder="e.g., Called to confirm receipt on 5/15. Rep was named John." className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                            Add Log
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Item List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Your Log</h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                     {items.length > 0 ? items.map(item => (
                        <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                           <div className="flex flex-wrap justify-between items-start gap-2">
                               <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.serviceName}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.type} - Submitted: {new Date(item.dateSubmitted).toLocaleDateString()}</p>
                                    {item.notes && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic">Note: {item.notes}</p>}
                               </div>
                               <div className="flex items-center gap-2">
                                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>{item.status}</span>
                                     <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="h-4 w-4" /></button>
                               </div>
                           </div>
                           <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Update Status:</span>
                                {(['Pending', 'Approved', 'Denied', 'Completed'] as const).map(status => (
                                    <button key={status} onClick={() => handleUpdateStatus(item.id, status)} className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${item.status === status ? 'bg-amber-200 dark:bg-amber-600 text-amber-800 dark:text-amber-50 border-amber-300 dark:border-amber-500' : 'bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500 border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200'}`}>{status}</button>
                                ))}
                                {item.status === 'Denied' && (
                                    <button onClick={() => handleGenerateAppeal(item)} className="ml-auto flex items-center gap-1.5 px-2.5 py-1 text-xs text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full border border-red-200 dark:border-red-700">
                                        <SparklesIcon className="h-3 w-3" />
                                        Generate Appeal
                                    </button>
                                )}
                           </div>
                        </div>
                     )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No items logged yet. Add one to get started.</p>}
                </div>
            </div>

            {/* Helper Tools */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Helper Tools</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Decode confusing insurance language with AI.</p>
                <form onSubmit={handleSimplify} className="space-y-3">
                    <label htmlFor="jargon" className="text-sm font-medium text-slate-600 dark:text-slate-300">Enter insurance term or phrase to simplify</label>
                    <textarea
                        id="jargon"
                        value={jargon}
                        onChange={(e) => setJargon(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g., 'prior authorization for durable medical equipment'"
                    />
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSimplifying} className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400">
                            <SparklesIcon className="h-4 w-4" />
                            {isSimplifying ? 'Simplifying...' : 'Simplify Term'}
                        </button>
                    </div>
                </form>
                {simplification.error && <p className="text-red-600 dark:text-red-300 mt-4 text-sm">{simplification.error}</p>}
                {simplification.text && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg">
                        <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{simplification.text}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Fix: Add default export to make the component available for import.
export default InsuranceNavigator;