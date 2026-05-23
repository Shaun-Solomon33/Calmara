import React, { useState } from 'react';
import ResourceDiscovery from './ResourceDiscovery';
import InsuranceNavigator from './InsuranceNavigator';
import PeerSupportNetwork from './PeerSupportNetwork';
import SearchIcon from './icons/SearchIcon';
import InsuranceIcon from './icons/InsuranceIcon';
import UsersIcon from './icons/UsersIcon';
import BackButton from './BackButton';

interface FamilySupportProps {
    onGoHome: () => void;
}

const TABS = ['Resource Discovery', 'Insurance Helper', 'Peer Support'];
const ICONS = {
    'Resource Discovery': SearchIcon,
    'Insurance Helper': InsuranceIcon,
    'Peer Support': UsersIcon,
};

const FamilySupport: React.FC<FamilySupportProps> = ({ onGoHome }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Resource Discovery':
                return <ResourceDiscovery />;
            case 'Insurance Helper':
                return <InsuranceNavigator />;
            case 'Peer Support':
                return <PeerSupportNetwork />;
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
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Family Support Command Center</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Tools to support the entire caregiver ecosystem.</p>
            </div>
            
            <div className="mb-8 flex justify-center border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = ICONS[tab as keyof typeof ICONS];
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center flex-shrink-0 gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-amber-500 dark:border-amber-400 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
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

export default FamilySupport;