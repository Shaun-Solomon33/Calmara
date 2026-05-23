import React, { useState } from 'react';
import type { PeerProfileQuery, PeerProfile } from '../types';
import { findPeerMatches } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import ErrorDisplay from './ErrorDisplay';
import MessageSquareIcon from './icons/MessageSquareIcon';
import PeerChatModal from './PeerChatModal';

const CHALLENGE_OPTIONS = ["Sensory Issues", "Anxiety Management", "School (IEP/504)", "Communication", "Finding Therapies", "Caregiver Burnout"];

const PeerSupportNetwork: React.FC = () => {
    const [query, setQuery] = useState<PeerProfileQuery>({
        childAge: 7,
        location: 'Oakville',
        challenges: ['Sensory Issues'],
    });
    const [results, setResults] = useState<PeerProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
    const [chattingWith, setChattingWith] = useState<PeerProfile | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuery(prev => ({ ...prev, [name]: name === 'childAge' ? parseInt(value, 10) || 0 : value }));
    };

    const handleChallengeChange = (challenge: string) => {
        setQuery(prev => ({
            ...prev,
            challenges: prev.challenges.includes(challenge)
                ? prev.challenges.filter(c => c !== challenge)
                : [...prev.challenges, challenge]
        }));
    };

    const handleFindMatches = async () => {
        if (!query.location.trim() || query.challenges.length === 0) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        setConnectedPeers([]); // Reset connections on new search
        try {
            const result = await findPeerMatches(query);
            setResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFindMatches();
    };

    const handleConnect = (peerName: string) => {
        if (!connectedPeers.includes(peerName)) {
            setConnectedPeers(prev => [...prev, peerName]);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {chattingWith && <PeerChatModal peer={chattingWith} onClose={() => setChattingWith(null)} />}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Peer Support Network</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Find other caregivers who understand. Set your profile to get matched.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="childAge" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Your Child's Age</label>
                            <input id="childAge" name="childAge" type="number" min="0" value={query.childAge} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Your City or Area</label>
                            <input id="location" name="location" type="text" value={query.location} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">What are your current challenges?</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CHALLENGE_OPTIONS.map(opt => (
                                <label key={opt} className="flex items-center space-x-2 bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer has-[:checked]:bg-amber-50 has-[:checked]:border-amber-400 dark:has-[:checked]:bg-amber-900/50 dark:has-[:checked]:border-amber-600 transition-colors">
                                    <input type="checkbox" checked={query.challenges.includes(opt)} onChange={() => handleChallengeChange(opt)} className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-amber-600 focus:ring-amber-500" />
                                    <span className="text-sm text-slate-700 dark:text-slate-200">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed">
                            <SparklesIcon className="h-5 w-5" />
                            {isLoading ? 'Finding Matches...' : 'Find My Peers'}
                        </button>
                    </div>
                </form>
            </div>
            
            {isLoading && <div className="text-center text-slate-500 dark:text-slate-400">Searching for your community...</div>}
            
            {error && <ErrorDisplay message={error} onRetry={handleFindMatches} />}

            {results.length > 0 && (
                <div className="animate-fade-in">
                     <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-6">Here are some families you might connect with:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {results.map((peer, index) => {
                            const isConnected = connectedPeers.includes(peer.name);
                            return (
                                <div key={index} className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xl">{peer.name}</h4>
                                    <p className="text-amber-700 dark:text-amber-400 text-sm font-semibold mb-2">{peer.connectionReason}</p>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">"{peer.bio}"</p>
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Shared Interests</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {peer.sharedInterests.map(interest => (
                                                <span key={interest} className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => isConnected ? setChattingWith(peer) : handleConnect(peer.name)}
                                        className={`w-full mt-auto px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                            isConnected
                                                ? 'text-white bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500'
                                                : 'text-slate-800 bg-slate-200 hover:bg-slate-300 dark:text-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {isConnected ? (
                                            <>
                                                <MessageSquareIcon className="h-4 w-4" />
                                                Message {peer.name.split(' ')[0]}
                                            </>
                                        ) : (
                                            `Connect with ${peer.name.split(' ')[0]}`
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeerSupportNetwork;
