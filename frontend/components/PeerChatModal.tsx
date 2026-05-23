import React, { useState, useEffect, useRef } from 'react';
import type { PeerProfile } from '../types';
import { simulatePeerChat } from '../services/geminiService';
import SendIcon from './icons/SendIcon';
import XIcon from './icons/XIcon';

interface PeerChatModalProps {
    peer: PeerProfile;
    onClose: () => void;
}

interface Message {
    sender: 'user' | 'peer';
    text: string;
}

const PeerChatModal: React.FC<PeerChatModalProps> = ({ peer, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Start with a greeting from the peer
        setIsThinking(true);
        simulatePeerChat(
            "Start the conversation by saying hello, warmly introducing yourself, and mentioning one of your interests or your connection reason.",
            [],
            peer,
        ).then(peerResponse => {
            setMessages([{ sender: 'peer', text: peerResponse }]);
        }).finally(() => setIsThinking(false));
    }, [peer]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const messageText = userInput.trim();
        if (!messageText || isThinking) return;

        const userMessage: Message = { sender: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsThinking(true);

        try {
            const history = messages.map((message) => ({
                role: message.sender === 'peer' ? 'assistant' as const : 'user' as const,
                content: message.text,
            }));
            const peerResponse = await simulatePeerChat(messageText, history, peer);
            const newPeerMessage: Message = { sender: 'peer', text: peerResponse };
            setMessages(prev => [...prev, newPeerMessage]);
        } catch (error) {
            console.error("Error sending peer message:", error);
            const errorMessage: Message = { sender: 'peer', text: "Sorry, I got a bit distracted. Could you say that again?" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="chat-heading">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] max-h-[700px] flex flex-col p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 id="chat-heading" className="text-xl font-bold text-slate-800 dark:text-slate-100">Chat with {peer.name}</h2>
                    <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" aria-label="Close chat">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isThinking && <div className="flex justify-start"><div className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-2xl"><span className="animate-pulse">...</span></div></div>}
                    <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isThinking}
                        aria-label="Your message"
                    />
                    <button type="submit" disabled={isThinking || !userInput.trim()} className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-400 dark:bg-amber-500 text-white hover:bg-amber-500 dark:hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 flex items-center justify-center transition-colors" aria-label="Send message">
                        <SendIcon className="h-6 w-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PeerChatModal;
