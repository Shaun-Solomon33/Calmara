import React, { useState, useEffect, useMemo } from 'react';
import type { WellnessLogEntry } from '../types';
import TrashIcon from './icons/TrashIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

const RESOURCES = [
    { title: 'Find Respite Care', description: 'Search for local services that can provide temporary relief.', link: '#' },
    { title: 'Mental Health Support', description: 'Connect with therapists who specialize in caregiver support.', link: '#' },
    { title: 'Peer Support Groups', description: 'Join a community of caregivers who understand what you\'re going through.', link: '#' },
    { title: 'Guided Breathing Exercises', description: 'Use simple exercises to reduce stress in the moment.', link: '#' },
];

const CaregiverWellness: React.FC = () => {
    const [logs, setLogs] = useState<WellnessLogEntry[]>(() => {
        const saved = localStorage.getItem('calmara-wellnessLogs');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [stressLevel, setStressLevel] = useState(3);
    const [hasRested, setHasRested] = useState<boolean | null>(null);
    const [supportLevel, setSupportLevel] = useState(3);
    
    useEffect(() => {
        localStorage.setItem('calmara-wellnessLogs', JSON.stringify(logs));
    }, [logs]);

    const hasLoggedToday = useMemo(() => {
        if (logs.length === 0) return false;
        const lastLogDate = new Date(logs[0].timestamp).toDateString();
        const todayDate = new Date().toDateString();
        return lastLogDate === todayDate;
    }, [logs]);

    const burnoutStatus = useMemo(() => {
        if (logs.length < 3) return 'none';
        const recentLogs = logs.slice(0, 3);
        const highStressCount = recentLogs.filter(log => log.stressLevel >= 4).length;
        
        if (highStressCount === 3) return 'high';
        if (highStressCount === 2) return 'moderate';
        return 'none';
    }, [logs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (hasRested === null) return;

        const newLog: WellnessLogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            stressLevel,
            hasRested,
            supportLevel,
        };
        setLogs(prev => [newLog, ...prev]);
        setHasRested(null);
    };

    const handleDelete = (id: string) => {
        setLogs(prev => prev.filter(log => log.id !== id));
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Caregiver Wellness Check-in</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Take a moment to check in with yourself. Your wellbeing matters.</p>
                
                {hasLoggedToday ? (
                     <div className="text-center p-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg">
                        <p className="font-semibold">Thanks for checking in today!</p>
                        <p className="text-sm">You can add a new entry tomorrow.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="stressLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">How stressed have you felt today? <span className="font-bold text-amber-600 dark:text-amber-400">{stressLevel}</span>/5</label>
                            <input id="stressLevel" type="range" min="1" max="5" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500 dark:accent-amber-400"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Have you had time to rest or relax this week?</label>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setHasRested(true)} className={`w-full p-3 rounded-lg border text-sm font-medium transition-colors ${hasRested === true ? 'bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-100 border-amber-300 dark:border-amber-600' : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>Yes</button>
                                <button type="button" onClick={() => setHasRested(false)} className={`w-full p-3 rounded-lg border text-sm font-medium transition-colors ${hasRested === false ? 'bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-100 border-amber-300 dark:border-amber-600' : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}>No</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="supportLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">How supported do you feel right now? <span className="font-bold text-amber-600 dark:text-amber-400">{supportLevel}</span>/5</label>
                            <input id="supportLevel" type="range" min="1" max="5" value={supportLevel} onChange={(e) => setSupportLevel(parseInt(e.target.value, 10))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500 dark:accent-amber-400"/>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={hasRested === null} className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed">
                                Log Wellness
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {burnoutStatus !== 'none' && (
                <div className="bg-red-50 dark:bg-red-900/50 border-2 border-dashed border-red-200 dark:border-red-700 rounded-2xl p-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangleIcon className="h-6 w-6 text-red-500"/>
                        <h3 className="text-xl font-bold text-red-800 dark:text-red-200">Burnout Risk Detected</h3>
                    </div>
                    <p className="text-red-700 dark:text-red-300 mb-6">We've noticed a pattern of high stress in your recent check-ins. It's important to take care of yourself. Here are some resources that might help:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {RESOURCES.map(res => (
                            <a key={res.title} href={res.link} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white dark:bg-slate-700 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{res.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{res.description}</p>
                            </a>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Your Wellness History</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {logs.length > 0 ? (
                        logs.map(log => (
                             <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Stress: {log.stressLevel}/5 | Rested: {log.hasRested ? 'Yes' : 'No'} | Support: {log.supportLevel}/5</p>
                                </div>
                                <button onClick={() => handleDelete(log.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" aria-label="Delete entry">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">No wellness entries yet. Add one above to get started.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CaregiverWellness;