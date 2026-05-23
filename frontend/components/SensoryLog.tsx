
import React, { useState } from 'react';
import type { SensoryLogEntry } from '../types';
import { SENSORY_SENSITIVITIES } from '../types';
import TrashIcon from './icons/TrashIcon';

interface SensoryLogProps {
    logs: SensoryLogEntry[];
    setLogs: React.Dispatch<React.SetStateAction<SensoryLogEntry[]>>;
}

const SensoryLog: React.FC<SensoryLogProps> = ({ logs, setLogs }) => {
    const [stressLevel, setStressLevel] = useState(5);
    const [environment, setEnvironment] = useState('');
    const [triggers, setTriggers] = useState<string[]>([]);
    
    const handleTriggerChange = (trigger: string) => {
        setTriggers(prev => 
            prev.includes(trigger) 
            ? prev.filter(t => t !== trigger)
            : [...prev, trigger]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!environment.trim()) return;

        const newLog: SensoryLogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            stressLevel,
            environment,
            triggers,
        };
        setLogs(prev => [newLog, ...prev]);
        // Reset form
        setStressLevel(5);
        setEnvironment('');
        setTriggers([]);
    };
    
    const handleDelete = (id: string) => {
        setLogs(prev => prev.filter(log => log.id !== id));
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Log Your Current State</h3>
                <p className="text-slate-600 mb-6">Track how you feel to discover patterns over time.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="stressLevel" className="block text-sm font-medium text-slate-600 mb-2">Current Stress Level: <span className="font-bold text-teal-600">{stressLevel}</span>/10</label>
                        <input
                            id="stressLevel"
                            type="range"
                            min="1"
                            max="10"
                            value={stressLevel}
                            onChange={(e) => setStressLevel(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="environment" className="block text-sm font-medium text-slate-600 mb-1">Your Environment</label>
                        <input
                            id="environment"
                            type="text"
                            value={environment}
                            onChange={(e) => setEnvironment(e.target.value)}
                            placeholder="e.g., Hospital waiting room, Dentist's chair"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">What are you experiencing?</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SENSORY_SENSITIVITIES.map(trigger => (
                                <label key={trigger} className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200 cursor-pointer has-[:checked]:bg-teal-50 has-[:checked]:border-teal-400 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={triggers.includes(trigger)}
                                        onChange={() => handleTriggerChange(trigger)}
                                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-slate-700">{trigger}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                            Add Log Entry
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Recent Entries</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {logs.length > 0 ? (
                        logs.map(log => (
                             <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-semibold text-slate-700">Stress: {log.stressLevel}/10 in "{log.environment}"</p>
                                    <p className="text-sm text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                                    {log.triggers.length > 0 && (
                                        <p className="text-sm text-slate-600 mt-1">Triggers: {log.triggers.join(', ')}</p>
                                    )}
                               </div>
                                <button onClick={() => handleDelete(log.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="Delete entry">
                                    <TrashIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">No log entries yet. Add one above to get started.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SensoryLog;