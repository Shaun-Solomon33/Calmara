import React, { useState, useEffect } from 'react';

const CARDS = [
    { text: "I need a break.", icon: 'pausa' },
    { text: "This hurts.", icon: 'pain' },
    { text: "I don't understand.", icon: '?' },
    { text: "I feel overwhelmed.", icon: 'overwhelmed' },
    { text: "Can you explain that differently?", icon: 'explain' },
    { text: "Please slow down.", icon: 'slow' },
    { text: "I need a minute to think.", icon: 'think' },
    { text: "I am finished.", icon: 'done' },
    { text: "Yes", icon: 'yes' },
    { text: "No", icon: 'no' },
];

const AacCards: React.FC = () => {
    const [isSupported, setIsSupported] = useState(true);
    const [speakingText, setSpeakingText] = useState<string | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            setIsSupported(false);
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

        // Ensure speech is cancelled on component unmount
        return () => {
             if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.onvoiceschanged = null;
            }
        }
    }, []);

    const speak = (text: string) => {
        if (!isSupported || speakingText) return;

        // Cancel any previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        setSpeakingText(text);
        
        utterance.onend = () => {
            setSpeakingText(null);
        };
        
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setSpeakingText(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    if (!isSupported) {
        return <div className="text-center p-6 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-200">
            <h3 className="font-bold">Text-to-Speech Not Supported</h3>
            <p>Sorry, your browser doesn't support the feature needed for these cards to speak. You can still use them visually.</p>
        </div>
    }

    const getIcon = (icon: string) => {
        switch(icon) {
            case 'pausa': return '⏸️';
            case 'pain': return '🩹';
            case '?': return '❓';
            case 'overwhelmed': return '🤯';
            case 'explain': return '💬';
            case 'slow': return '🐢';
            case 'think': return '🤔';
            case 'done': return '✅';
            case 'yes': return '👍';
            case 'no': return '👎';
            default: return '📣';
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
             <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Augmentative Communication Support</h3>
                <p className="text-slate-600 dark:text-slate-300">Tap a card to speak. A clear way to express your needs.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {CARDS.map(card => {
                    const isSpeaking = speakingText === card.text;
                    return (
                        <button
                            key={card.text}
                            onClick={() => speak(card.text)}
                            disabled={!!speakingText}
                            aria-pressed={isSpeaking}
                            className={`flex flex-col items-center justify-center text-center p-4 aspect-square bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 dark:disabled:opacity-60 disabled:cursor-not-allowed ${isSpeaking ? 'ring-4 ring-green-400 dark:ring-green-500 scale-105' : 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'}`}
                        >
                            <div className="text-5xl mb-2">{getIcon(card.icon)}</div>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{card.text}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default AacCards;
