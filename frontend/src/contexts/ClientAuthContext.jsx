import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as clientAuthService from "../services/client/clientAuthService";
import { TOKEN_KEY, REFRESH_KEY } from "../constants";

export const ClientAuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: () => {},
});

export const ClientAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const info = clientAuthService.getAuthInfo();
    setUser(info);
    return info;
  }, []);

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, [refreshUser]);
  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (user) {
          setUser(null);
        }
        return;
      }

      const info = clientAuthService.getAuthInfo();
      if (!info && user) {
        setUser(null);
        navigate("/auth/login", {
          replace: true,
          state: { from: location.pathname, expired: true },
        });
      }
    };

    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [user, navigate, location.pathname]);

  /* ── Login ── */
  const login = useCallback(
    async (username, password) => {
      const data = await clientAuthService.login(username, password);
      if (data?.result?.authenticated) {
        const info = clientAuthService.getAuthInfo();
        setUser(info);
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
        return info;
      }
      throw new Error("Đăng nhập thất bại.");
    },
    [navigate, location.state],
  );

  /* ── Logout ── */
  const logout = useCallback(async () => {
    await clientAuthService.logout();
    setUser(null);
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => useContext(ClientAuthContext);
