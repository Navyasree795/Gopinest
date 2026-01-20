import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  phone: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string) => void;
  logout: () => void;
  setAdmin: (isAdmin: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("smartstay_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (phone: string) => {
    const newUser = { phone, isAdmin: phone === "9999999999" };
    setUser(newUser);
    localStorage.setItem("smartstay_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("smartstay_user");
  };

  const setAdmin = (isAdmin: boolean) => {
    if (user) {
      const updatedUser = { ...user, isAdmin };
      setUser(updatedUser);
      localStorage.setItem("smartstay_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
