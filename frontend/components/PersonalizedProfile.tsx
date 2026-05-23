import React, { useState, useEffect } from 'react';
import type { MedicalProfile, MedicalHistoryEntry } from '../types';
import AutismProfileForm from './AutismProfileForm';
import MedicalHistoryLog from './MedicalHistoryLog';
import EmergencyProtocol from './EmergencyProtocol';
import UserIcon from './icons/UserIcon';
import HistoryIcon from './icons/HistoryIcon';
import SirenIcon from './icons/SirenIcon';
import BackButton from './BackButton';

interface PersonalizedProfileProps {
    onGoHome: () => void;
}

const TABS = ['Autism Profile', 'Medical History', 'Emergency Protocol'];
const ICONS = {
    'Autism Profile': UserIcon,
    'Medical History': HistoryIcon,
    'Emergency Protocol': SirenIcon,
};

const PersonalizedProfile: React.FC<PersonalizedProfileProps> = ({ onGoHome }) => {
    const [activeTab, setActiveTab] = useState(TABS[0]);
    
    const [profile, setProfile] = useState<MedicalProfile>(() => {
        const saved = localStorage.getItem('calmara-medicalProfile');
        return saved ? JSON.parse(saved) : {
            communication: 'I prefer direct, literal language. Please allow me extra time to process and respond to questions.',
            sensory: 'Sensitive to bright, fluorescent lighting and sudden loud noises. The waiting room can be overwhelming if crowded.',
            calming: 'Deep pressure (e.g., a weighted lap pad) and listening to music with headphones are very effective for me.',
            accommodations: 'Please explain what you are going to do before you do it. A quiet, less-crowded waiting area is ideal.'
        };
    });

    const [history, setHistory] = useState<MedicalHistoryEntry[]>(() => {
         const saved = localStorage.getItem('calmara-medicalHistory');
         return saved ? JSON.parse(saved) : [];
    });
    
    const [name, setName] = useState<string>(() => {
         const saved = localStorage.getItem('calmara-userName');
         return saved || '';
    });
    
    useEffect(() => {
        localStorage.setItem('calmara-medicalProfile', JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
        localStorage.setItem('calmara-medicalHistory', JSON.stringify(history));
    }, [history]);
    
     useEffect(() => {
        localStorage.setItem('calmara-userName', name);
    }, [name]);


    const renderTabContent = () => {
        switch(activeTab) {
            case 'Autism Profile':
                return <AutismProfileForm profile={profile} setProfile={setProfile} name={name} setName={setName} />;
            case 'Medical History':
                return <MedicalHistoryLog history={history} setHistory={setHistory} />;
            case 'Emergency Protocol':
                return <EmergencyProtocol profile={profile} />;
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
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Personalized Medical Profile</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Your portable hub for consistent, informed healthcare.</p>
            </div>
            
            <div className="mb-8 flex justify-center border-b border-slate-200 dark:border-slate-700">
                {TABS.map(tab => {
                    const Icon = ICONS[tab as keyof typeof ICONS];
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
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

export default PersonalizedProfile;