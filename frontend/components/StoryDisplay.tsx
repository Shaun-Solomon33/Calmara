import React, { useState, useEffect } from 'react';
import type { StoryStep } from '../types';
import Volume2Icon from './icons/Volume2Icon';

interface StoryDisplayProps {
    steps: StoryStep[];
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ steps }) => {
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
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {steps.map((step, index) => {
                const isSpeaking = speakingText === step.text;
                return (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
                        <div className="aspect-square w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            {step.imageUrl ? (
                                <img src={step.imageUrl} alt={step.text} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 dark:bg-slate-600 flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-white/60 dark:bg-slate-700/70 mb-4 flex items-center justify-center">
                                        <Volume2Icon className="h-8 w-8 text-slate-400 dark:text-slate-300" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-200">Image unavailable</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">Story text is still ready to use.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed flex-grow">
                                <span className="font-bold text-blue-600 dark:text-blue-400">{index + 1}.</span> {step.text}
                            </p>
                            {isSpeechSupported && (
                                <button
                                    onClick={() => handleSpeak(step.text)}
                                    className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isSpeaking
                                            ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                    }`}
                                    aria-label={`Read aloud: ${step.text}`}
                                >
                                    <Volume2Icon className="h-5 w-5" />
                                    <span>{isSpeaking ? 'Reading...' : 'Read Aloud'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StoryDisplay;
