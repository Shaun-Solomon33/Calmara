import React from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface ErrorDisplayProps {
    message: string;
    onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
    return (
        <div className="w-full max-w-lg mx-auto text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-red-200 dark:border-red-800/50 animate-fade-in" role="alert">
            <div className="mx-auto mb-4 bg-red-100 dark:bg-red-900/50 h-16 w-16 rounded-full flex items-center justify-center">
                <AlertTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Oops! Something went wrong.</h2>
            <p className="text-red-700 dark:text-red-300 mb-6">{message}</p>
            <button
                onClick={onRetry}
                className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-slate-600 hover:bg-slate-700 dark:text-slate-800 dark:bg-slate-300 dark:hover:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
};

export default ErrorDisplay;
