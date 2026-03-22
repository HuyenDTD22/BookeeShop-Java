import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/admin/authService";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  hasPermission: () => false,
  hasRole: () => false,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const info = authService.getAuthInfo();
    setUser(info);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const isAuthPage = location.pathname.includes("/auth/");
    if (!user && !isAuthPage) {
      navigate(`/${ADMIN}/auth/login`, { replace: true });
    }
    if (user && isAuthPage) {
      navigate(`/${ADMIN}/`, { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  useEffect(() => {
    if (loading) return;

    const check = () => {
      const isAuthPage = location.pathname.includes("/auth/");
      if (isAuthPage) return;

      const info = authService.getAuthInfo();
      if (!info && user) {
        setUser(null);
        navigate(`/${ADMIN}/auth/login`, {
          replace: true,
          state: { expired: true },
        });
      }
    };

    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [user, loading, location.pathname, navigate]);

  /* ── Login ── */
  const login = useCallback(
    async (username, password) => {
      const data = await authService.login(username, password);
      if (data?.result?.authenticated) {
        const info = authService.getAuthInfo();
        if (!info || (!info.isAdmin && !info.isStaff)) {
          await authService.logout();
          throw new Error("Tài khoản không có quyền truy cập trang quản trị.");
        }
        setUser(info);
        navigate(`/${ADMIN}/`, { replace: true });
        return info;
      }
      throw new Error("Đăng nhập thất bại.");
    },
    [navigate],
  );

  /* ── Logout ── */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    navigate(`/${ADMIN}/auth/login`, { replace: true });
  }, [navigate]);

  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user],
  );

  const hasPermission = useCallback(
    (perm) => user?.permissions?.includes(perm) ?? false,
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        hasPermission,
        hasRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
