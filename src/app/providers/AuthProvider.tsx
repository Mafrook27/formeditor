import { AuthProvider } from "@/app/context/auth-context";
import { CustomerProvider } from "@/app/context/CustomerContext";
import type { ReactNode } from "react";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <CustomerProvider>{children}</CustomerProvider>
    </AuthProvider>
  );
};
