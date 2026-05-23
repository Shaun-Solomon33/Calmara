import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 font-sans text-center">
            <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-lg border border-red-200 dark:border-red-800/50">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Something went wrong.</h1>
                <p className="text-slate-600 dark:text-slate-300 mb-8">We're sorry for the trouble. Please refresh the page to try again.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-red-800 dark:text-red-100 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
