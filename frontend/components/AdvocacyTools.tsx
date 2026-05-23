import React, { useState, useEffect } from 'react';
import type { IncidentLogEntry, AdvocacyLetterQuery } from '../types';
import { generateAdvocacyLetter } from '../services/geminiService';
import TrashIcon from './icons/TrashIcon';
import SparklesIcon from './icons/SparklesIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import PrinterIcon from './icons/PrinterIcon';

const ADVOCACY_RESOURCES = [
    { name: 'The Arc of the United States', desc: 'Advocacy for people with intellectual and developmental disabilities.', link: 'https://thearc.org/' },
    { name: 'Disability Rights Education & Defense Fund (DREDF)', desc: 'National civil rights law and policy center.', link: 'https://dredf.org/' },
    { name: 'Autism Self Advocacy Network (ASAN)', desc: 'Advocacy by and for autistic people.', link: 'https://autisticadvocacy.org/' },
    { name: 'Wrightslaw', desc: 'Accurate, reliable information about special education law.', link: 'https://www.wrightslaw.com/' },
];

const AdvocacyTools: React.FC = () => {
    // Incident Log State
    const [logs, setLogs] = useState<IncidentLogEntry[]>(() => {
        const saved = localStorage.getItem('calmara-incidentLogs');
        return saved ? JSON.parse(saved) : [];
    });
    const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], location: '', individualsInvolved: '', description: '' });

    // Letter Generator State
    const [letterQuery, setLetterQuery] = useState<AdvocacyLetterQuery>({ letterType: 'School Accommodation', details: '' });
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        localStorage.setItem('calmara-incidentLogs', JSON.stringify(logs));
    }, [logs]);

    // Incident Log Handlers
    const handleLogChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewLog(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLog.description.trim() || !newLog.location.trim()) return;
        const logToAdd: IncidentLogEntry = { ...newLog, id: Date.now().toString() };
        setLogs(prev => [logToAdd, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setNewLog({ date: new Date().toISOString().split('T')[0], location: '', individualsInvolved: '', description: '' });
    };

    const handleDeleteLog = (id: string) => setLogs(prev => prev.filter(log => log.id !== id));
    
    const handlePrintLog = (log: IncidentLogEntry) => {
         const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Incident Report</title><style>body{font-family:sans-serif;line-height:1.5;padding:1rem}h1{border-bottom:2px solid #eee;padding-bottom:0.5rem;}p{margin:0.5rem 0;}strong{display:inline-block;width:180px;}</style></head><body>');
            printWindow.document.write('<h1>Incident Report</h1>');
            printWindow.document.write(`<p><strong>Date of Incident:</strong> ${new Date(log.date).toLocaleDateString()}</p>`);
            printWindow.document.write(`<p><strong>Location:</strong> ${log.location}</p>`);
            printWindow.document.write(`<p><strong>Individuals Involved:</strong> ${log.individualsInvolved || 'N/A'}</p>`);
            printWindow.document.write('<h3>Description of Incident</h3>');
            printWindow.document.write(`<p>${log.description.replace(/\n/g, '<br>')}</p>`);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    // Letter Generator Handlers
    const handleLetterQueryChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLetterQuery(prev => ({ ...prev, [name]: value as any }));
    };

    const handleGenerateLetter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!letterQuery.details.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedLetter('');
        try {
            const result = await generateAdvocacyLetter(letterQuery);
            setGeneratedLetter(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyLetterToClipboard = () => {
        navigator.clipboard.writeText(generatedLetter);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Incident Log */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Incident Log</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Create a legal-grade record of discriminatory or inadequate care.</p>
                <form onSubmit={handleAddLog} className="space-y-4 mb-8">
                    {/* Form fields: date, location, individuals, description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label htmlFor="date" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Date</label>
                             <input id="date" name="date" type="date" value={newLog.date} onChange={handleLogChange} required className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Location</label>
                            <input id="location" name="location" type="text" value={newLog.location} onChange={handleLogChange} required placeholder="e.g., City General Hospital" className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="individualsInvolved" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Individuals Involved (Optional)</label>
                        <input id="individualsInvolved" name="individualsInvolved" type="text" value={newLog.individualsInvolved} onChange={handleLogChange} placeholder="e.g., Dr. Smith, Nurse Johnson" className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Description of Incident</label>
                        <textarea id="description" name="description" value={newLog.description} onChange={handleLogChange} rows={4} required placeholder="Be as specific as possible. Describe what happened, what was said, and the impact." className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-5 py-2 text-sm font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700">Add to Log</button>
                    </div>
                </form>
                 <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Logged Incidents</h4>
                 <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                     {logs.length > 0 ? logs.map(log => (
                        <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                           <div className="flex justify-between items-start gap-2">
                               <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{log.location}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date(log.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-wrap">{log.description}</p>
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                   <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon className="h-4 w-4" /></button>
                                   <button onClick={() => handlePrintLog(log)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"><PrinterIcon className="h-4 w-4" /></button>
                               </div>
                           </div>
                        </div>
                     )) : <p className="text-slate-500 dark:text-slate-400 text-center py-4">No incidents logged yet.</p>}
                </div>
            </div>

            {/* AI Letter Generator */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">AI Letter Generator</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Draft formal letters for accommodations, appeals, and more.</p>
                <form onSubmit={handleGenerateLetter} className="space-y-4">
                    <div>
                        <label htmlFor="letterType" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Letter Type</label>
                        <select id="letterType" name="letterType" value={letterQuery.letterType} onChange={handleLetterQueryChange} className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
                            <option>School Accommodation</option>
                            <option>Insurance Appeal</option>
                            <option>Procedural Change Request</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Key Details to Include</label>
                        <textarea id="details" name="details" value={letterQuery.details} onChange={handleLetterQueryChange} rows={5} required placeholder="e.g., 'My son, Alex, needs access to a quiet room during exams to accommodate his sensory processing disorder.' or 'We are appealing the denial of coverage for ABA therapy, claim #12345.'" className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                     <div className="flex justify-end">
                        <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg shadow-sm text-amber-800 dark:text-amber-100 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400">
                            <SparklesIcon className="h-4 w-4" />
                            {isLoading ? 'Generating...' : 'Generate Letter'}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-600 dark:text-red-300 mt-4 text-sm">{error}</p>}
                {generatedLetter && (
                     <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Generated Draft:</h4>
                             <button onClick={copyLetterToClipboard} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                                 <ClipboardIcon className="h-4 w-4" />
                                 Copy
                             </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg max-h-80 overflow-y-auto">
                            <pre className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap font-sans text-sm">{generatedLetter}</pre>
                        </div>
                     </div>
                )}
            </div>
            
            {/* Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Advocacy Links & Resources</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Direct links to disability rights organizations and legal help.</p>
                <div className="space-y-4">
                    {ADVOCACY_RESOURCES.map(res => (
                        <a href={res.link} key={res.name} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{res.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{res.desc}</p>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdvocacyTools;