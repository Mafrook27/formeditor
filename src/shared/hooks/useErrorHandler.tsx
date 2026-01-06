import { useEffect } from "react";

// 1️⃣ TYPE DEFINITIONS
interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  // context?: Record<string, unknown>;
}

// 2️⃣ HOOK - Global error handler for async operations
export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { onError } = options;

  // 3️⃣ HANDLER - Handle errors manually
  const handleError = (error: Error | unknown) => {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Call custom error handler if provided
    if (onError) {
      onError(errorObj);
    }

    // In development, log to console
    if (import.meta.env.DEV) {
      console.error("Error handled by useErrorHandler:", errorObj);
    }
  };

  return { handleError };
};

// 4️⃣ HOOK - Global unhandled error listener
export const useGlobalErrorHandler = () => {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();

      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      console.error("Unhandled Promise Rejection:", error);
    };

    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();

      console.error("Global Error:", event.error || event.message);
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    // Cleanup
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);
};

// 5️⃣ HOOK - Async error handler for try-catch blocks
export const useAsyncError = () => {
  const { handleError } = useErrorHandler();

  const wrapAsync = <T,>(
    asyncFn: () => Promise<T>,
    onError?: (error: Error) => void,
  ): Promise<T | undefined> => {
    return asyncFn().catch((error) => {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      handleError(errorObj);
      if (onError) {
        onError(errorObj);
      }
      return undefined;
    });
  };

  return { wrapAsync, handleError };
};
