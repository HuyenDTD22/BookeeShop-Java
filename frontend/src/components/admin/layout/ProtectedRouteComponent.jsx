import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/admin/layout.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const ProtectedRouteComponent = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-inner">
          <div
            className="spinner"
            style={{ width: 36, height: 36, borderWidth: 3, margin: "0 auto" }}
          />
          <p className="auth-loading-text">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${ADMIN}/auth/login`} replace />;
  }

  return children;
};

export default ProtectedRouteComponent;
