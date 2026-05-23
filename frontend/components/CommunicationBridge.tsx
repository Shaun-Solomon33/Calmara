import React, { useState } from 'react';
import BehaviorTranslator from './BehaviorTranslator';
import JargonSimplifier from './JargonSimplifier';
import TranslateIcon from './icons/TranslateIcon';
import FileTextIcon from './icons/FileTextIcon';
import BackButton from './BackButton';

interface CommunicationBridgeProps {
    onGoHome: () => void;
}

const TABS = ['Behavior Translator', 'Jargon Simplifier'];
const ICONS = {
    'Behavior Translator': TranslateIcon,
    'Jargon Simplifier': FileTextIcon,
};


const CommunicationBridge: React.FC<CommunicationBridgeProps> = ({ onGoHome }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Behavior Translator':
                return <BehaviorTranslator />;
            case 'Jargon Simplifier':
                return <JargonSimplifier />;
            default:
                return null;
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
             <div className="relative h-10">
                <BackButton onClick={onGoHome} />
            </div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Communication Bridge AI</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Tools to ensure everyone is heard and understood.</p>
            </div>
            
            <div className="mb-8 flex justify-center border-b border-slate-200 dark:border-slate-700">
                {TABS.map(tab => {
                    const Icon = ICONS[tab as keyof typeof ICONS];
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-green-500 dark:border-green-400 text-green-600 dark:text-green-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
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

export default CommunicationBridge;