/* eslint-disable react-refresh/only-export-components */

import type { LoginResponse } from "@/features/auth/api/authApi";
import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
  user: LoginResponse | null;
  setUser: (user: LoginResponse | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
