// Auth Context - State Management
import { createContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export context for use in useAuth hook
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // TODO: Validate token and fetch user data
        // For now, just set a dummy user
        setUser({
          id: "1",
          email: "user@example.com",
          name: "John Doe",
        });
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Replace with actual API call
    console.log("Login attempt with:", email, password);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser = {
        id: "1",
        email,
        name: "John Doe",
      };

      setUser(mockUser);
      localStorage.setItem("auth_token", "mock-token");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
