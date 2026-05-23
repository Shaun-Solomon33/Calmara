import React, { useState, useEffect } from 'react';
import type { SensoryLogEntry } from '../types';
import SensoryLog from './SensoryLog';
import AiInsights from './AiInsights';
import FacilityExplorer from './FacilityExplorer';
import LogIcon from './icons/LogIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import BuildingIcon from './icons/BuildingIcon';

interface SensoryNavigatorProps {
    onGoHome: () => void;
}

const TABS = ['Sensory Log', 'AI Insights', 'Facility Explorer'];
const ICONS = {
    'Sensory Log': LogIcon,
    'AI Insights': LightbulbIcon,
    'Facility Explorer': BuildingIcon,
};

const SensoryNavigator: React.FC<SensoryNavigatorProps> = ({ onGoHome }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    
    const [sensoryLogs, setSensoryLogs] = useState<SensoryLogEntry[]>(() => {
        const saved = localStorage.getItem('calmara-sensoryLogs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('calmara-sensoryLogs', JSON.stringify(sensoryLogs));
    }, [sensoryLogs]);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'Sensory Log':
                return <SensoryLog logs={sensoryLogs} setLogs={setSensoryLogs} />;
            case 'AI Insights':
                return <AiInsights logs={sensoryLogs} />;
            case 'Facility Explorer':
                return <FacilityExplorer />;
            default:
                return null;
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800">Sensory-Aware Navigator</h1>
                <p className="mt-2 text-lg text-slate-600">Track, understand, and prepare for sensory experiences.</p>
            </div>
            
            <div className="mb-8 flex justify-center border-b border-slate-200">
                {TABS.map(tab => {
                    const Icon = ICONS[tab as keyof typeof ICONS];
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
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
                    className="px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default SensoryNavigator;