import React, { useState } from 'react';
import type { MedicalProfile } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface AutismProfileFormProps {
    profile: MedicalProfile;
    setProfile: React.Dispatch<React.SetStateAction<MedicalProfile>>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
}

const AutismProfileForm: React.FC<AutismProfileFormProps> = ({ profile, setProfile, name, setName }) => {
    const [formData, setFormData] = useState(profile);
    const [localName, setLocalName] = useState(name);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalName(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Use a short timeout to make the saving state visible, mimicking an async operation
        setTimeout(() => {
            setProfile(formData);
            setName(localName);
            setIsSaving(false);
            setShowConfirmation(true);
            setTimeout(() => setShowConfirmation(false), 3000);
        }, 500);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Your Autism Profile</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">This information helps create your emergency protocol and provider guides. Be as detailed as you feel comfortable.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Your Name (Optional)</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={localName}
                            onChange={handleNameChange}
                            placeholder="Enter your name"
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for personalizing the Provider Guide.</p>
                    </div>
                    <div>
                        <label htmlFor="communication" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Communication Preferences</label>
                        <textarea
                            id="communication"
                            name="communication"
                            value={formData.communication}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., I need extra time to process questions. I prefer written information."
                        />
                    </div>
                     <div>
                        <label htmlFor="sensory" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Sensory Triggers & Needs</label>
                        <textarea
                            id="sensory"
                            name="sensory"
                            value={formData.sensory}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Fluorescent lights are painful. The smell of hand sanitizer is overwhelming."
                        />
                    </div>
                     <div>
                        <label htmlFor="calming" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Successful Calming Strategies</label>
                        <textarea
                            id="calming"
                            name="calming"
                            value={formData.calming}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Listening to music with headphones, deep pressure, stimming with a fidget toy."
                        />
                    </div>
                     <div>
                        <label htmlFor="accommodations" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Medical Accommodation Needs</label>
                        <textarea
                            id="accommodations"
                            name="accommodations"
                            value={formData.accommodations}
                            onChange={handleChange}
                            rows={4}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Please explain procedures before doing them. Allow a support person to be present."
                        />
                    </div>
                    <div className="flex justify-end items-center gap-4 pt-2">
                         {showConfirmation && (
                            <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-fade-in">
                                <CheckCircleIcon className="h-5 w-5" />
                                Profile Saved!
                            </span>
                         )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-purple-800 dark:text-purple-100 bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AutismProfileForm;
