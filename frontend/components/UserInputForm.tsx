import React, { useState } from 'react';
import type { UserInput } from '../types';
import { COMMUNICATION_STYLES, SENSORY_SENSITIVITIES, ANXIETY_TRIGGERS, APPOINTMENT_TYPES } from '../types';
import CheckboxGroup from './CheckboxGroup';
import SparklesIcon from './icons/SparklesIcon';
import BackButton from './BackButton';

interface UserInputFormProps {
    onSubmit: (data: UserInput) => void;
    isLoading: boolean;
    onGoHome: () => void;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, isLoading, onGoHome }) => {
    const [formData, setFormData] = useState<UserInput>({
        name: '',
        age: 8,
        communicationStyle: COMMUNICATION_STYLES[0],
        sensorySensitivities: [],
        anxietyTriggers: [],
        doctorName: 'Dr. Smith',
        appointmentType: APPOINTMENT_TYPES[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'age' ? parseInt(value, 10) : value }));
    };

    const handleCheckboxChange = (field: keyof UserInput) => (selected: string[]) => {
        setFormData(prev => ({ ...prev, [field]: selected }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="relative h-10">
                <BackButton onClick={onGoHome} />
            </div>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Smart Medical Appointment Preparation</h1>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">Let's create a full preparation kit for your upcoming medical visit.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Name (Optional)</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Alex" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Age</label>
                        <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} min="1" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="doctorName" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Doctor's Name</label>
                        <input type="text" id="doctorName" name="doctorName" value={formData.doctorName} onChange={handleChange} required placeholder="e.g., Dr. Patel" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                     <div>
                        <label htmlFor="appointmentType" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Appointment Type</label>
                        <select id="appointmentType" name="appointmentType" value={formData.appointmentType} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 sm:text-sm">
                            {APPOINTMENT_TYPES.map(type => <option key={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="communicationStyle" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Communication Style</label>
                    <select id="communicationStyle" name="communicationStyle" value={formData.communicationStyle} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-200 sm:text-sm">
                        {COMMUNICATION_STYLES.map(style => <option key={style}>{style}</option>)}
                    </select>
                </div>
                
                <CheckboxGroup label="Sensory Sensitivities" options={SENSORY_SENSITIVITIES} selectedOptions={formData.sensorySensitivities} onChange={handleCheckboxChange('sensorySensitivities')} />
                <CheckboxGroup label="Anxiety Triggers" options={ANXIETY_TRIGGERS} selectedOptions={formData.anxietyTriggers} onChange={handleCheckboxChange('anxietyTriggers')} />

                <div className="pt-4">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-slate-800 dark:text-blue-100 bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                        <SparklesIcon className="h-5 w-5"/>
                        {isLoading ? 'Building Your Hub...' : 'Create Preparation Hub'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserInputForm;