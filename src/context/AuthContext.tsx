import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { setAccessTokenProvider, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useFCM } from "@/hooks/useFCM";

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
}

interface AuthUser {
  _id: string;
  name?: string;
  mobile: string;
  role: 'user' | 'owner' | 'admin';
  isAdmin?: boolean;
  isOwner?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isValidJWT = (token: string | null) => {
  if (!token) return false;
  return token.split(".").length === 3;
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const enrichUser = (user: AuthUser): AuthUser => ({
  ...user,
  isAdmin: user.role === 'admin',
  isOwner: user.role === 'owner' || user.role === 'admin'
});

const FCMHandler = () => {
  const { isAuthenticated } = useAuth();
  useFCM(isAuthenticated);
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("smartstay_user");
    if (!storedUser) return null;
    try {
      const parsedUser = JSON.parse(storedUser);
      return enrichUser(parsedUser);
    } catch (e) {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("smartstay_accessToken");
    if (storedToken && isValidJWT(storedToken) && !isTokenExpired(storedToken)) {
      return storedToken;
    }
    localStorage.removeItem("smartstay_accessToken");
    localStorage.removeItem("smartstay_user");
    return null;
  });

  const refreshTokenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const login = (newAccessToken: string, loggedInUser: AuthUser) => {
    if (!isValidJWT(newAccessToken)) {
      console.error("Invalid JWT token received");
      return;
    }

    const enrichedUser = enrichUser(loggedInUser);
    setAccessToken(newAccessToken);
    setUser(enrichedUser);

    localStorage.setItem("smartstay_accessToken", newAccessToken);
    localStorage.setItem("smartstay_user", JSON.stringify(enrichedUser));
  };

  const logout = async (redirect: boolean = true) => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (error) {
      console.error("Error during backend logout:", error);
    }

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("smartstay_accessToken");
    localStorage.removeItem("smartstay_user");

    if (redirect) navigate('/auth');
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to refresh token");

      const data = await response.json();
      if (data.success && isValidJWT(data.accessToken)) {
        setAccessToken(data.accessToken);
        localStorage.setItem("smartstay_accessToken", data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error", error);
      logout(false);
      return false;
    }
  };

  const setupTokenRefreshTimer = (token: string) => {
    if (!isValidJWT(token)) return;
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const expiresIn = decoded.exp - Date.now() / 1000;
      const refreshInMs = Math.max(0, (expiresIn - 60) * 1000);

      if (refreshTokenTimeoutRef.current) clearTimeout(refreshTokenTimeoutRef.current);
      
      refreshTokenTimeoutRef.current = setTimeout(() => {
        refreshAccessToken();
      }, refreshInMs);
    } catch (error) {
      console.error("Token timer error", error);
    }
  };

  useEffect(() => {
    if (accessToken) setupTokenRefreshTimer(accessToken);
    return () => {
      if (refreshTokenTimeoutRef.current) clearTimeout(refreshTokenTimeoutRef.current);
    };
  }, [accessToken]);

  useEffect(() => {
    setAccessTokenProvider(() => accessToken);
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        refreshAccessToken
      }}
    >
      <FCMHandler />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
