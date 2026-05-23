import React, { useState } from 'react';
import type { ResourceQuery, Resource } from '../types';
import { findResources } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import ErrorDisplay from './ErrorDisplay';

const ResourceDiscovery: React.FC = () => {
    const [query, setQuery] = useState<ResourceQuery>({
        need: 'speech therapy',
        location: 'Springfield',
        age: 5,
    });
    const [results, setResults] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuery(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value, 10) || 0 : value }));
    };

    const handleFindResources = async () => {
        if (!query.need.trim() || !query.location.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const result = await findResources(query);
            setResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFindResources();
    };

    const getCategoryStyle = (type: Resource['type']) => {
        switch (type) {
            case 'Therapy Center': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Respite Care': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Support Group': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'Government Program': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Advocacy Group': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };

    const renderContactInfo = (contact: string) => {
        // Strip leading "Contact: " if present, as the AI sometimes includes it.
        const cleanedContact = contact.replace(/^Contact:\s*/i, '');

        // Regex to find URLs (http, https, www) and email addresses.
        const combinedRegex = /((?:https?:\/\/|www\.)\S+)|(\S+@\S+\.\S+)/g;

        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = combinedRegex.exec(cleanedContact)) !== null) {
            // Add the text before the match
            if (match.index > lastIndex) {
                parts.push(cleanedContact.substring(lastIndex, match.index));
            }

            let linkText = match[0];
            let trailingPunctuation = '';
            
            // Check for and separate trailing punctuation like '.', ',', ')'
            const puncMatch = linkText.match(/[.,)]+$/);
            if (puncMatch) {
                trailingPunctuation = puncMatch[0];
                linkText = linkText.substring(0, linkText.length - trailingPunctuation.length);
            }

            const isUrl = /^(https?:\/\/|www\.)/.test(linkText);

            if (isUrl) {
                const href = linkText.startsWith('www.') ? `https://${linkText}` : linkText;
                parts.push(
                    <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className="font-normal text-amber-700 dark:text-amber-400 hover:underline break-all">
                        {linkText}
                    </a>
                );
            } else { // It must be an email if it's not a URL
                parts.push(
                    <a key={match.index} href={`mailto:${linkText}`} className="font-normal text-amber-700 dark:text-amber-400 hover:underline break-all">
                        {linkText}
                    </a>
                );
            }
            
            // Add back the trailing punctuation as plain text
            if (trailingPunctuation) {
                parts.push(trailingPunctuation);
            }

            lastIndex = combinedRegex.lastIndex;
        }

        // Add any remaining text after the last match
        if (lastIndex < cleanedContact.length) {
            parts.push(cleanedContact.substring(lastIndex));
        }

        return parts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);
    };


    return (
        <div className="w-full max-w-3xl mx-auto space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Intelligent Resource Discovery</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Tell us what you need, and our AI will find personalized resources for you.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="need" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">What are you looking for?</label>
                            <input id="need" name="need" type="text" value={query.need} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Your City or Area</label>
                            <input id="location" name="location" type="text" value={query.location} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Child's Age</label>
                        <input id="age" name="age" type="number" min="0" value={query.age} onChange={handleChange} required className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed">
                            <SparklesIcon className="h-5 w-5" />
                            {isLoading ? 'Searching...' : 'Find Resources'}
                        </button>
                    </div>
                </form>
            </div>
            
            {isLoading && <div className="text-center text-slate-500 dark:text-slate-400">Finding resources for you...</div>}
                
            {error && <ErrorDisplay message={error} onRetry={handleFindResources} />}

            {results.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 animate-fade-in">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Your Matched Resources</h3>
                    <div className="space-y-6">
                        {results.map((res, index) => (
                             <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{res.name}</h4>
                                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryStyle(res.type)}`}>{res.type}</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 mb-2">{res.description}</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Contact: {renderContactInfo(res.contactInfo)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceDiscovery;
