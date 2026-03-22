import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiBookOpen,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import "../../../styles/client/client-auth.css";

const LoginPage = () => {
  const { login } = useClientAuth();
  const navigate = useNavigate();
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
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await login(form.username.trim().toLowerCase(), form.password);
    } catch {
      setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />

      <div className="auth-card">
        <div className="auth-card-bar" />
        <div className="auth-card-body">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FiBookOpen size={26} color="#fff" />
            </div>
            <h1 className="auth-logo-title">BookeeShop</h1>
            <p className="auth-logo-subtitle">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>

          {/* Thông báo phiên hết hạn */}
          {isExpired && !error && (
            <div className="auth-alert auth-alert-info">
              <FiInfo size={15} style={{ flexShrink: 0 }} />
              <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
            </div>
          )}

          {/* Lỗi đăng nhập */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <FiAlertCircle
                size={16}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <FiMail size={15} />
                </span>
                <input
                  name="username"
                  type="email"
                  className={`auth-input with-left-icon${error ? " error" : ""}`}
                  placeholder="ten@email.com"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 7,
                }}
              >
                <label className="auth-label" style={{ margin: 0 }}>
                  Mật khẩu
                </label>
                <Link
                  to="/auth/forgot-password"
                  style={{
                    fontSize: "0.8rem",
                    color: "#1a6dc4",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <FiLock size={15} />
                </span>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  className={`auth-input with-both-icon${error ? " error" : ""}`}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" /> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div className="auth-link-row" style={{ marginTop: 24 }}>
            Chưa có tài khoản? <Link to="/auth/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
