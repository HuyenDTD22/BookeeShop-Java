import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FiBookOpen,
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/admin/login.css";

const LoginPageAdmin = () => {
  const { login } = useAuth();
  const location = useLocation();
  const isExpired = location.state?.expired === true;

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await login(form.username.trim(), form.password);
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-gradient" />
      <div className="login-bg-grid" />

      <div className="login-card animate-fadeIn">
        <div className="login-card-accent-bar" />

        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <FiBookOpen size={24} color="#0d1117" />
          </div>
          <h1 className="login-title">BookeeShop</h1>
          <p className="login-subtitle">Cổng quản trị hệ thống</p>
        </div>

        {/* Thông báo phiên hết hạn */}
        {isExpired && !error && (
          <div
            className="alert-admin animate-fadeIn"
            style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              background: "rgba(26,109,196,0.08)",
              border: "1px solid rgba(26,109,196,0.25)",
              borderRadius: 8,
              color: "#1a6dc4",
              fontSize: "0.875rem",
            }}
          >
            <FiInfo size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
          </div>
        )}

        {/* Lỗi */}
        {error && (
          <div
            className="alert-admin alert-danger-admin animate-fadeIn"
            style={{ marginBottom: 20 }}
          >
            <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group-admin">
            <label className="form-label-admin">Email</label>
            <div className="input-wrap">
              <span className="login-input-icon">
                <FiUser size={15} />
              </span>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                placeholder="ten@email.com"
                autoComplete="username"
                autoFocus
                className="form-control-admin input-with-left-icon"
              />
            </div>
          </div>

          <div className="form-group-admin">
            <label className="form-label-admin">Mật khẩu</label>
            <div className="input-wrap">
              <span className="login-input-icon">
                <FiLock size={15} />
              </span>
              <input
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                className="form-control-admin input-with-both-icon"
              />
              <button
                type="button"
                className="login-pass-toggle"
                onClick={() => setShowPass((s) => !s)}
              >
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-admin login-submit-btn"
          >
            {loading ? (
              <>
                <div
                  className="spinner"
                  style={{ width: 16, height: 16, borderWidth: 2 }}
                />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPageAdmin;
