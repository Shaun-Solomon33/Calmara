import React, { useState } from 'react';
import { translateBehavior } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';

const BehaviorTranslator: React.FC = () => {
    const [behavior, setBehavior] = useState('');
    const [translation, setTranslation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!behavior.trim()) return;

        setIsLoading(true);
        setError('');
        setTranslation('');
        try {
            const result = await translateBehavior(behavior);
            setTranslation(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">Behavior Translation Engine</h3>
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6">Describe a behavior to get a clear, objective explanation for medical professionals.</p>
                
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={behavior}
                        onChange={(e) => setBehavior(e.target.value)}
                        placeholder="e.g., 'Rocking back and forth while humming during the check-up.'"
                        className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !behavior.trim()}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-green-800 dark:text-green-100 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        <SparklesIcon className="h-5 w-5" />
                        {isLoading ? 'Translating...' : 'Translate Behavior'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                {translation && (
                    <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg animate-fade-in">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Professional Interpretation:</h4>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{translation}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BehaviorTranslator;
