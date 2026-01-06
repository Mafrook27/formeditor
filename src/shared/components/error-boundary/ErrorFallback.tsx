import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-red-500 to-orange-500 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Oops! Something went wrong</h1>
              <p className="text-red-100 text-sm mt-1">
                We're working to fix this issue
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Details
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 font-mono text-sm wrap-break-word">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={resetError}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </div>

          {/* User-friendly message */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>What can you do?</strong> Try refreshing the page or
              going back to the home page. If the problem persists, please
              contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
