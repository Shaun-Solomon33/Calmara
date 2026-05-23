import React, { useState, useCallback } from 'react';
import Home from './components/Home';
import UserInputForm from './components/UserInputForm';
import PreparationHub from './components/PreparationHub';
import LoadingScreen from './components/LoadingScreen';
import CommunicationBridge from './components/CommunicationBridge';
import PersonalizedProfile from './components/PersonalizedProfile';
import FamilySupport from './components/FamilySupport';
import ErrorDisplay from './components/ErrorDisplay';
import { generateEnvironmentalPrep, generateStoryWithImages } from './services/geminiService';
import type { UserInput, StoryStep, EnvironmentalPrepData } from './types';
import ThemeToggler from './components/ThemeToggler';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import Login from '@/src/pages/Login';
import Register from '@/src/pages/Register';

type View = 'home' | 'preparation' | 'communicationBridge' | 'profile' | 'familySupport';

const App: React.FC = () => {
    const pathname = window.location.pathname;
    const [view, setView] = useState<View>('home');
    const [userInput, setUserInput] = useState<UserInput | null>(null);
    const [storySteps, setStorySteps] = useState<StoryStep[] | null>(null);
    const [prepData, setPrepData] = useState<EnvironmentalPrepData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = useCallback(() => {
        setStorySteps(null);
        setPrepData(null);
        setUserInput(null);
        setError(null);
        setIsLoading(false);
    }, []);

    const handleGenerateStory = useCallback(async (input: UserInput) => {
        resetState();
        setIsLoading(true);
        setUserInput(input);

        try {
            const [storyWithImages, environmentalData] = await Promise.all([
                generateStoryWithImages(input),
                generateEnvironmentalPrep(input)
            ]);
            
            setPrepData(environmentalData);
            const initialStory: StoryStep[] = storyWithImages.map((step) => ({
                text: step.text,
                imageUrl: step.imageUrl,
            }));
            setStorySteps(initialStory);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [resetState]);

    const handleGoHome = () => {
        resetState();
        setView('home');
    };
    
    const handleSelectFeature = (feature: View) => {
        resetState();
        setView(feature);
    };

    const renderContent = () => {
        switch(view) {
            case 'home':
                return <Home onSelectFeature={handleSelectFeature} />;
            case 'preparation':
                if (isLoading && !storySteps) {
                    return <LoadingScreen />;
                }
                if (error) {
                    return <ErrorDisplay message={error} onRetry={() => {
                        if (userInput) handleGenerateStory(userInput);
                        else handleGoHome();
                    }} />;
                }
                if (storySteps && prepData && userInput) {
                    return <PreparationHub storySteps={storySteps} prepData={prepData} userInput={userInput} onGoHome={handleGoHome} />;
                }
                return <UserInputForm onSubmit={handleGenerateStory} isLoading={isLoading} onGoHome={handleGoHome} />;
            
            case 'communicationBridge':
                 return <CommunicationBridge onGoHome={handleGoHome} />;
            
            case 'profile':
                 return <PersonalizedProfile onGoHome={handleGoHome} />;
            
            case 'familySupport':
                return <FamilySupport onGoHome={handleGoHome} />;

            default:
                 return <Home onSelectFeature={handleSelectFeature} />;
        }
    };

    if (pathname === '/login') {
        return (
            <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
                <ThemeToggler />
                <Login />
            </main>
        );
    }

    if (pathname === '/register') {
        return (
            <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
                <ThemeToggler />
                <Register />
            </main>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
                <ThemeToggler />
                {renderContent()}
            </main>
        </ProtectedRoute>
    );
};

export default App;
