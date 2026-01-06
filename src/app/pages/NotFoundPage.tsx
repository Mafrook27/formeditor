import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[150px] font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 leading-none">
              404
            </h1>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Search className="h-20 w-20 text-purple-300 dark:text-purple-700 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            It might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </button>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Lost?</strong> Use the navigation menu or go back to the
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
