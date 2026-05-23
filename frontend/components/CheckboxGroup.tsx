import React from 'react';

interface CheckboxGroupProps {
    label: string;
    options: string[];
    selectedOptions: string[];
    onChange: (selected: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, options, selectedOptions, onChange }) => {
    const handleCheckboxChange = (option: string) => {
        const newSelected = selectedOptions.includes(option)
            ? selectedOptions.filter((item) => item !== option)
            : [...selectedOptions, option];
        onChange(newSelected);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {options.map((option) => (
                    <label key={option} className="flex items-center space-x-2 bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 dark:has-[:checked]:bg-blue-900/50 dark:has-[:checked]:border-blue-500 transition-colors">
                        <input
                            type="checkbox"
                            value={option}
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleCheckboxChange(option)}
                            className="h-4 w-4 rounded border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default CheckboxGroup;
