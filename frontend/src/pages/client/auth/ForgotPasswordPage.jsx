import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookOpen, FiMail, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { sendOtp } from "../../../services/client/clientAuthService";
import "../../../styles/client/client-auth.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Email không hợp lệ.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await sendOtp(trimmed);
      // Chuyển sang trang nhập OTP, mang theo email
      navigate("/auth/verify-otp", { state: { email: trimmed } });
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 1005) {
        // Không tiết lộ email không tồn tại vì bảo mật
        // Vẫn chuyển sang trang OTP để không leak thông tin
        navigate("/auth/verify-otp", { state: { email: trimmed } });
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
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
            <h1 className="auth-logo-title">Quên mật khẩu</h1>
            <p className="auth-logo-subtitle">
              Nhập email để nhận mã xác thực OTP
            </p>
          </div>

          {/* Step badge */}
          <div style={{ textAlign: "center" }}>
            <span className="auth-step-badge">Bước 1 / 3 — Xác thực email</span>
          </div>

          <div
            className="auth-alert auth-alert-info"
            style={{ fontSize: "0.82rem" }}
          >
            <FiAlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Chức năng này chỉ dành cho tài khoản khách hàng. Mã OTP sẽ được
              gửi đến email của bạn và có hiệu lực trong <strong>5 phút</strong>
              .
            </span>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label className="auth-label">Email tài khoản</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <FiMail size={15} />
                </span>
                <input
                  type="email"
                  className={`auth-input with-left-icon ${error ? "error" : ""}`}
                  placeholder="ten@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" /> Đang gửi OTP...
                </>
              ) : (
                "Gửi mã OTP"
              )}
            </button>
          </form>

          <div className="auth-link-row">
            <Link
              to="/auth/login"
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <FiArrowLeft size={14} /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
