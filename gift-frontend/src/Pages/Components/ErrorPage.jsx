import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
    const [errorCode, setErrorCode] = useState('500');
    const [errorMessage, setErrorMessage] = useState('Something went wrong');

    useEffect(() => {
        // Get error details from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code') || '500';
        const message = urlParams.get('message') || 'An unexpected error occurred';

        setErrorCode(code);
        setErrorMessage(decodeURIComponent(message));
    }, []);

    const getErrorTitle = (code) => {
        switch (code) {
            case '400':
                return 'Bad Request';
            case '401':
                return 'Unauthorized';
            case '403':
                return 'Access Forbidden';
            case '404':
                return 'Page Not Found';
            case '500':
                return 'Server Error';
            case '502':
                return 'Bad Gateway';
            case '503':
                return 'Service Unavailable';
            case '0':
                return 'Network Error';
            default:
                return 'Error Occurred';
        }
    };

    const getErrorDescription = (code) => {
        switch (code) {
            case '400':
                return 'The request was invalid. Please check your input and try again.';
            case '401':
                return 'You need to log in to access this resource.';
            case '403':
                return "You don't have permission to access this resource.";
            case '404':
                return 'The page or resource you are looking for could not be found.';
            case '500':
                return 'Our server encountered an internal error. Please try again later.';
            case '502':
                return 'The server received an invalid response from the upstream server.';
            case '503':
                return 'The service is temporarily unavailable. Please try again later.';
            case '0':
                return 'Unable to connect to the server. Please check your internet connection.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                    {/* Error Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    {/* Error Code */}
                    <div className="mb-4">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-2">{errorCode}</h1>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">
                            {getErrorTitle(errorCode)}
                        </h2>
                    </div>

                    {/* Error Description */}
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            {getErrorDescription(errorCode)}
                        </p>
                        {errorMessage && errorMessage !== getErrorDescription(errorCode) && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <p className="text-sm text-gray-700">
                                    <strong>Details:</strong> {errorMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRefresh}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleGoBack}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>

                            <button
                                onClick={handleGoHome}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </button>
                        </div>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            If this problem persists, please contact our support team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;