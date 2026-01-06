import { useEffect } from "react";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface UseDailyVitalsToastProps {
  isError: boolean;
  isSuccess: boolean;
  toastId: string; // passed as a prop
  reloadCallback?: () => void; // optional custom reload function
}

export const useToast = ({
  isError,
  isSuccess,
  toastId,
  reloadCallback,
}: UseDailyVitalsToastProps) => {
  // Show error toast when fetch fails
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong. Please try again.", {
        id: toastId,
        duration: Infinity,
        className: "w-auto whitespace-nowrap px-6 py-3 min-w-fit",
        action: {
          label: (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <RotateCcw className="h-4 w-4" />
              Reload
            </div>
          ),
          onClick: reloadCallback || (() => window.location.reload()),
        },
      });
    }
  }, [isError, toastId, reloadCallback]);

  // Hide toast when fetch succeeds
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss(toastId);
    }
  }, [isSuccess, toastId]);

  // Hide toast on component unmount
  useEffect(() => {
    return () => {
      toast.dismiss(toastId);
    };
  }, [toastId]);
};
