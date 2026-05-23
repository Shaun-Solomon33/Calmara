import React from 'react';
import type { EnvironmentalPrepData } from '../types';

interface EnvironmentalPrepProps {
    prepData: EnvironmentalPrepData;
}

const EnvironmentalPrep: React.FC<EnvironmentalPrepProps> = ({ prepData }) => {
    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Sensory Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">What to Expect at the Clinic</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Here are a few things you might see, hear, or smell during your visit.</p>
                <ul className="space-y-4">
                    {prepData.sensoryProfile.map((profile, index) => (
                        <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm mr-4 mt-1">
                                !
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{profile.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400">{profile.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Personalized Checklist Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Your Personalized Checklist</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">A few ideas to help you feel more comfortable and prepared.</p>
                <div className="space-y-5">
                    {prepData.checklist.map((item, index) => (
                        <label key={index} htmlFor={`checklist-item-${index}`} className="relative flex items-start p-3 -m-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                             <div className="flex items-center h-6">
                                <input
                                    id={`checklist-item-${index}`}
                                    name="checklist"
                                    type="checkbox"
                                    className="peer h-6 w-6 shrink-0 rounded-md border border-slate-400 dark:border-slate-500 checked:bg-blue-200 dark:checked:bg-blue-700 checked:border-blue-200 dark:checked:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 appearance-none transition-colors"
                                />
                                 <svg
                                    className="absolute w-6 h-6 hidden peer-checked:block text-blue-800 dark:text-blue-100 pointer-events-none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className="ml-4 text-sm">
                                <span className="font-medium text-slate-800 dark:text-slate-100 peer-checked:line-through">{item.item}</span>
                                <p id={`checklist-item-description-${index}`} className="text-slate-500 dark:text-slate-400">{item.reason}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EnvironmentalPrep;
