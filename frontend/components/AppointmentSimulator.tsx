import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { UserInput } from '../types';
import { simulateAppointment } from '../services/geminiService';
import MicrophoneIcon from './icons/MicrophoneIcon';

// Fix for SpeechRecognition missing from Window type
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface AppointmentSimulatorProps {
    userInput: UserInput;
}

interface Message {
    sender: 'user' | 'doctor';
    text: string;
}

const AppointmentSimulator: React.FC<AppointmentSimulatorProps> = ({ userInput }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Effect for loading speech synthesis voices
    useEffect(() => {
        if (!('speechSynthesis' in window)) {
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

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Use a memoized, robust `speak` function that cancels previous speech.
    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            window.speechSynthesis.speak(utterance);
        }
    }, [selectedVoice]);

    // Memoize sendMessage to prevent stale closures in event listeners.
    const sendMessage = useCallback(async (messageText: string) => {
        const userMessage: Message = { sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);

        try {
            const history = messages.map((message) => ({
                role: message.sender === 'doctor' ? 'assistant' as const : 'user' as const,
                content: message.text,
            }));
            const doctorResponse = await simulateAppointment(messageText, history);
            const newDoctorMessage: Message = { sender: 'doctor', text: doctorResponse };
            setMessages(prev => [...prev, newDoctorMessage]);
            speak(doctorResponse);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: Message = { sender: 'doctor', text: "I'm sorry, I'm having a little trouble hearing. Could we try again?" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    }, [messages, speak]);
    
    // Effect hook for initializing and managing speech recognition listeners.
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
        }
        
        const recognition = recognitionRef.current;

        const onResult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            sendMessage(transcript);
        };
        const onEnd = () => setIsListening(false);
        const onError = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        // Use addEventListener for robust setup and cleanup.
        recognition.addEventListener('result', onResult);
        recognition.addEventListener('end', onEnd);
        recognition.addEventListener('error', onError);

        return () => {
            recognition.removeEventListener('result', onResult);
            recognition.removeEventListener('end', onEnd);
            recognition.removeEventListener('error', onError);
        };
    }, [sendMessage]);


    // Effect hook for initializing the chat session.
    useEffect(() => {
        // Clear previous messages when user changes
        setMessages([]);

        // Start with a greeting from the doctor
        setIsThinking(true);
        simulateAppointment(
            `Start the conversation. The patient is ${userInput.name || 'a young person'}, age ${userInput.age}, preparing for a ${userInput.appointmentType} with ${userInput.doctorName}. Greet them warmly and ask how they are feeling today.`,
            [],
        ).then(doctorResponse => {
            setMessages([{ sender: 'doctor', text: doctorResponse }]);
            speak(doctorResponse);
        }).finally(() => setIsThinking(false));

    }, [userInput, speak]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleListen = () => {
        if (isListening || isThinking || !recognitionRef.current) return;
        setIsListening(true);
        recognitionRef.current.start();
    };
    
    if (!isSupported) {
        return <div className="text-center p-6 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg text-amber-800 dark:text-amber-200">
            <h3 className="font-bold">Speech Recognition Not Supported</h3>
            <p>Sorry, your browser doesn't support the speech recognition feature needed for this practice chat. Please try using a recent version of Chrome or Safari.</p>
        </div>
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 animate-fade-in">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-4">Practice Chat with {userInput.doctorName}</h3>
            <div className="h-96 overflow-y-auto bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-4 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-200 dark:bg-blue-600 text-slate-800 dark:text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isThinking && <div className="flex justify-start"><div className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-2xl "><span className="animate-pulse">...</span></div></div>}
                 <div ref={messagesEndRef} />
            </div>
            <div className="text-center">
                <button onClick={handleListen} disabled={isListening || isThinking} className={`relative w-24 h-24 rounded-full transition-colors duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200' : 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-700'}`}>
                    <MicrophoneIcon className="h-10 w-10" />
                    {isListening && <span className="absolute inset-0 rounded-full bg-red-400/50 animate-ping"></span>}
                </button>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{isListening ? 'Listening...' : (isThinking ? 'Thinking...' : 'Tap to speak')}</p>
            </div>
        </div>
    );
};

export default AppointmentSimulator;
