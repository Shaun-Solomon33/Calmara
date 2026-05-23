import React, { useState } from 'react';
import type { StoryStep, EnvironmentalPrepData, UserInput } from '../types';
import StoryDisplay from './StoryDisplay';
import AppointmentSimulator from './AppointmentSimulator';
import EnvironmentalPrep from './EnvironmentalPrep';
import BookOpenIcon from './icons/BookOpenIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ChecklistIcon from './icons/ChecklistIcon';
import BackButton from './BackButton';

interface PreparationHubProps {
    storySteps: StoryStep[];
    prepData: EnvironmentalPrepData;
    userInput: UserInput;
    onGoHome: () => void;
}

const TABS = ['Visual Story', 'Practice Chat', 'Get Ready'];
const ICONS = {
    'Visual Story': BookOpenIcon,
    'Practice Chat': MicrophoneIcon,
    'Get Ready': ChecklistIcon,
};

const PreparationHub: React.FC<PreparationHubProps> = ({ storySteps, prepData, userInput, onGoHome }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Visual Story':
                return <StoryDisplay steps={storySteps} />;
            case 'Practice Chat':
                return <AppointmentSimulator userInput={userInput} />;
            case 'Get Ready':
                return <EnvironmentalPrep prepData={prepData} />;
            default:
                return null;
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="relative h-10">
                 <BackButton onClick={onGoHome} />
            </div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Your Preparation Hub</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Everything you need to get ready for your appointment.</p>
            </div>
            
            <div className="mb-8 flex justify-center border-b border-slate-200 dark:border-slate-700">
                {TABS.map(tab => {
                    const Icon = ICONS[tab as keyof typeof ICONS];
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            aria-current={activeTab === tab ? 'page' : undefined}
                        >
                           <Icon className="h-5 w-5"/>
                           {tab}
                        </button>
                    )
                })}
            </div>

            <div className="p-4">
                {renderTabContent()}
            </div>

            <div className="mt-12 text-center">
                <button
                    onClick={onGoHome}
                    className="px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default PreparationHub;