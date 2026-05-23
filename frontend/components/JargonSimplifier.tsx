import React, { useState, useEffect } from 'react';
import { simplifyJargonWithImage } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import Volume2Icon from './icons/Volume2Icon';

interface SimplificationResult {
    text: string;
    imageUrl: string | null;
}

const JargonSimplifier: React.FC = () => {
    const [jargon, setJargon] = useState('');
    const [simplification, setSimplification] = useState<SimplificationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    const [isSpeechSupported, setIsSpeechSupported] = useState(true);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            setIsSpeechSupported(false);
            return;
        }

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;

            // Heuristic to find a soothing, female voice.
            const femaleVoice =
                voices.find(v => v.lang.startsWith('en') && /Google US English/i.test(v.name)) ||
                voices.find(v => v.lang.startsWith('en') && /Zira/i.test(v.name)) ||
                voices.find(v => v.lang.startsWith('en') && /Susan/i.test(v.name)) ||
                voices.find(v => v.lang.startsWith('en') && /Female/i.test(v.name)) ||
                voices.find(v => v.lang.startsWith('en') && !/Male/i.test(v.name) && v.localService);

            setSelectedVoice(femaleVoice || null);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        
        // Cleanup speech synthesis on component unmount
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const handleSpeak = (textToSpeak: string) => {
        if (!isSpeechSupported) return;

        // If the same text is already speaking, cancel it (toggling it off)
        if (speakingText === textToSpeak) {
            window.speechSynthesis.cancel();
            setSpeakingText(null);
            return;
        }

        // Cancel any currently speaking utterance before starting a new one
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.onend = () => {
            setSpeakingText(null);
        };
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setSpeakingText(null);
        };
        
        setSpeakingText(textToSpeak);
        window.speechSynthesis.speak(utterance);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jargon.trim()) return;

        setIsLoading(true);
        setError('');
        setSimplification(null);
        window.speechSynthesis.cancel(); // Stop any speech from previous results
        setSpeakingText(null);

        try {
            const { simplificationText, imageUrl } = await simplifyJargonWithImage(jargon);
            setSimplification({ text: simplificationText, imageUrl });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setSimplification(null); // Clear partial results on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">Medical Jargon Simplifier</h3>
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6">Enter a medical term or phrase to get a simple, clear explanation and a visual diagram.</p>
                
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={jargon}
                        onChange={(e) => setJargon(e.target.value)}
                        placeholder="e.g., 'CBC with differential to rule out lymphocytosis'"
                        className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !jargon.trim()}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-green-800 dark:text-green-100 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                         <SparklesIcon className="h-5 w-5" />
                        {isLoading ? 'Simplifying...' : 'Simplify Jargon'}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg">
                        {error}
                    </div>
                )}

                {isLoading && !simplification && (
                    <div className="mt-6 text-center text-slate-500 dark:text-slate-400">Generating explanation...</div>
                )}

                {simplification && (
                    <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg animate-fade-in space-y-6">
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">In Simple Terms:</h4>
                                {isSpeechSupported && simplification.text && (
                                    <button
                                        onClick={() => handleSpeak(simplification.text)}
                                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                            speakingText === simplification.text
                                                ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                        }`}
                                        aria-label={`Read aloud: ${simplification.text}`}
                                    >
                                        <Volume2Icon className="h-4 w-4" />
                                        <span>{speakingText === simplification.text ? 'Reading...' : 'Read Aloud'}</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{simplification.text}</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Visual Explanation:</h4>
                             <div className="aspect-square w-full max-w-sm mx-auto bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                                {simplification.imageUrl ? (
                                    <img src={simplification.imageUrl} alt="Visual explanation of medical jargon" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center p-6 text-center">
                                        <p className="text-slate-500 dark:text-slate-300 text-sm">Diagram image unavailable right now.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JargonSimplifier;
