import { useState, useEffect } from "react";

interface UseLoadingOptions {
  /** Initial loading state */
  initialLoading?: boolean;
  /** Auto-complete loading after this duration (ms) */
  duration?: number;
}

/**
 * Custom hook for managing loading states
 *
 * Usage:
 * const { isLoading, startLoading, stopLoading } = useLoading({ duration: 2000 });
 *
 * if (isLoading) return <Skeleton.TablePage columns={columns} />;
 */
export function useLoading({
  initialLoading = true,
  duration = 0,
}: UseLoadingOptions = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    if (initialLoading && duration > 0) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [initialLoading, duration]);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return { isLoading, startLoading, stopLoading, setIsLoading };
}

export default useLoading;
