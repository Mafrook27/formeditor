import { AuthProvider } from "@/app/context/auth-context";
import { CustomerProvider } from "@/app/context/CustomerContext";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import type { ReactNode } from "react";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <CustomerProvider>{children}</CustomerProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
