import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Getting your story ready...",
    "Drawing some friendly pictures...",
    "Preparing your practice session...",
    "Building your personalized checklist...",
    "Making things clear and simple for you...",
    "Just a few more moments...",
];

const LoadingScreen: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-blue-400 dark:border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Creating Your Preparation Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg transition-opacity duration-500">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};

export default LoadingScreen;
