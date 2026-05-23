import React from 'react';
import MedicalShieldIcon from './icons/MedicalShieldIcon';
import CommunicationIcon from './icons/CommunicationIcon';
import ProfileIcon from './icons/ProfileIcon';
import FamilySupportIcon from './icons/FamilySupportIcon';

interface HomeProps {
    onSelectFeature: (feature: 'preparation' | 'communicationBridge' | 'profile' | 'familySupport') => void;
}

const Home: React.FC<HomeProps> = ({ onSelectFeature }) => {
    return (
        <div className="w-full max-w-5xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl font-bold text-slate-800 dark:text-slate-100 mb-2">Welcome to Calmara</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">Your partner in supportive and prepared healthcare journeys.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feature Card 1 */}
                <button 
                    onClick={() => onSelectFeature('preparation')}
                    className="group text-left bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4 dark:focus:ring-offset-slate-900"
                >
                    <div className="mx-auto mb-6 bg-blue-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center transition-colors group-hover:bg-blue-200 dark:group-hover:bg-slate-600">
                        <MedicalShieldIcon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Smart Medical Appointment Preparation</h2>
                    <p className="text-slate-600 dark:text-slate-300">Create a personalized kit with a visual story, practice chat, and sensory checklist to reduce appointment anxiety.</p>
                </button>

                {/* Feature Card 2 */}
                <button 
                    onClick={() => onSelectFeature('communicationBridge')}
                    className="group text-left bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-4 dark:focus:ring-offset-slate-900"
                >
                    <div className="mx-auto mb-6 bg-green-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center transition-colors group-hover:bg-green-200 dark:group-hover:bg-slate-600">
                        <CommunicationIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Communication Bridge AI</h2>
                    <p className="text-slate-600 dark:text-slate-300">Translate behaviors, simplify medical jargon, and use AAC cards to ensure clear and effective communication.</p>
                </button>

                {/* Feature Card 3 */}
                 <button 
                    onClick={() => onSelectFeature('profile')}
                    className="group text-left bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-4 dark:focus:ring-offset-slate-900"
                >
                    <div className="mx-auto mb-6 bg-purple-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center transition-colors group-hover:bg-purple-200 dark:group-hover:bg-slate-600">
                        <ProfileIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Personalized Medical Profile</h2>
                    <p className="text-slate-600 dark:text-slate-300">Create a portable profile with your triggers, needs, and history to ensure consistent, autism-informed care.</p>
                </button>
                
                {/* Feature Card 4 */}
                 <button 
                    onClick={() => onSelectFeature('familySupport')}
                    className="group text-left bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-4 dark:focus:ring-offset-slate-900"
                >
                    <div className="mx-auto mb-6 bg-amber-100 dark:bg-slate-700 h-20 w-20 rounded-full flex items-center justify-center transition-colors group-hover:bg-amber-200 dark:group-hover:bg-slate-600">
                        <FamilySupportIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Family Support Command Center</h2>
                    <p className="text-slate-600 dark:text-slate-300">Monitor caregiver wellness, discover resources, and connect with a peer support network to prevent burnout.</p>
                </button>
            </div>
        </div>
    );
};

export default Home;