import React, { useState } from 'react';
import type { MedicalProfile } from '../types';
import { generateProviderGuide } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import PrinterIcon from './icons/PrinterIcon';
import ErrorDisplay from './ErrorDisplay';

interface ProviderGuideProps {
    profile: MedicalProfile;
    name: string;
}

const isProfileEmpty = (profile: MedicalProfile): boolean => {
    return !profile.communication?.trim() &&
           !profile.sensory?.trim() &&
           !profile.calming?.trim() &&
           !profile.accommodations?.trim();
};

const ProviderGuide: React.FC<ProviderGuideProps> = ({ profile, name }) => {
    const [guide, setGuide] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const profileIsEmpty = isProfileEmpty(profile);

    const handleGenerate = async () => {
        if (profileIsEmpty) return;
        setIsLoading(true);
        setError(null);
        setGuide('');
        try {
            const result = await generateProviderGuide(profile, name);
            setGuide(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Provider Guide</title>');
            printWindow.document.write(`
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                        line-height: 1.6; 
                        padding: 1.5rem;
                        color: #333;
                    } 
                    h1 { 
                        font-size: 1.75rem;
                        color: #111;
                        border-bottom: 2px solid #eee;
                        padding-bottom: 0.5rem;
                        margin-bottom: 1.5rem;
                    } 
                    pre { 
                        white-space: pre-wrap; 
                        word-wrap: break-word; 
                        font-family: inherit; 
                        font-size: 1rem;
                    }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write(`<h1>Guide for Working with ${name || 'the Patient'}</h1>`);
            printWindow.document.write(`<pre>${guide}</pre>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Provider Education Module</h3>
                        <p className="text-slate-600 dark:text-slate-300">Generate a "How to work with {name || 'me'}" guide for new doctors.</p>
                    </div>
                     {guide && (
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                            <PrinterIcon className="h-4 w-4"/>
                            Print Guide
                        </button>
                    )}
                </div>

                {!guide && !isLoading && !error && (
                    <div className="text-center py-8">
                        <button
                            onClick={handleGenerate}
                            disabled={profileIsEmpty}
                            className="w-full max-w-xs flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-purple-800 dark:text-purple-100 bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <SparklesIcon className="h-5 w-5"/>
                            Generate Guide
                        </button>
                         {profileIsEmpty && <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Please fill out your Autism Profile to generate a guide.</p>}
                    </div>
                )}
                
                {isLoading && <div className="text-center text-slate-500 dark:text-slate-400">Generating your provider guide...</div>}
                
                {error && <ErrorDisplay message={error} onRetry={handleGenerate} />}

                {guide && (
                    <div className="mt-6 p-6 bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-lg animate-fade-in">
                         <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Your Provider Guide:</h4>
                        <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans">{guide}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderGuide;
