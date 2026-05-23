import React, { useState } from 'react';
import type { SensoryLogEntry } from '../types';
import { analyzeSensoryPatterns } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import ErrorDisplay from './ErrorDisplay';

interface AiInsightsProps {
    logs: SensoryLogEntry[];
}

const AiInsights: React.FC<AiInsightsProps> = ({ logs }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis('');
        try {
            const result = await analyzeSensoryPatterns(logs);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">AI-Powered Sensory Insights</h3>
                    <p className="text-slate-600 mb-6">Let's analyze your logs to find patterns and suggest helpful strategies.</p>
                </div>

                {!analysis && !isLoading && !error && (
                    <div className="text-center py-8">
                        <button
                            onClick={handleGenerate}
                            disabled={logs.length < 3}
                            className="w-full max-w-xs flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <SparklesIcon className="h-5 w-5"/>
                            Analyze My Patterns
                        </button>
                        {logs.length < 3 && <p className="text-sm text-slate-500 mt-3">Please add at least {3 - logs.length} more log entries to enable analysis.</p>}
                    </div>
                )}
                
                {isLoading && <div className="text-center text-slate-500">Analyzing your logs...</div>}
                
                {error && <ErrorDisplay message={error} onRetry={handleGenerate} />}

                {analysis && (
                    <div className="mt-6">
                        <div className="p-6 bg-teal-50 border border-teal-200 rounded-lg animate-fade-in">
                            <h4 className="text-lg font-semibold text-slate-800 mb-2">Your Sensory Analysis:</h4>
                            <p className="text-slate-700 whitespace-pre-wrap font-sans">{analysis}</p>
                        </div>
                        <div className="text-center mt-6">
                             <button
                                onClick={handleGenerate}
                                className="text-sm font-medium text-teal-600 hover:text-teal-800"
                            >
                                Re-analyze with new data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiInsights;