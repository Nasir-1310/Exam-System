// Frontend/components/common/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                কিছু একটা ভুল হয়েছে
              </h2>

              <p className="text-gray-600 mb-6">
                ওয়েবসাইটে একটি ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করে আবার চেষ্টা করুন।
              </p>

              {/* Error Details (in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.resetError}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  আবার চেষ্টা করুন
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  হোম পেজে যান
                </button>
              </div>

              {/* Development Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  এই ওয়েবসাইটটি বর্তমানে ডেভেলপমেন্ট পর্যায়ে রয়েছে।
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;