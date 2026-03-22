import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiBookOpen,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import {
  sendOtp,
  verifyOtp,
  resetPassword,
} from "../../../services/client/clientAuthService";
import "../../../styles/client/client-auth.css";

const OTP_LENGTH = 6;
const RESEND_DELAY = 60; // giây

/* ── OTP Input Component ── */
const OtpInputRow = ({ value, onChange, hasError }) => {
  const inputRefs = useRef([]);
  const digits = value.split("");

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = [...digits];
      if (arr[idx]) {
        arr[idx] = "";
        onChange(arr.join(""));
      } else if (idx > 0) {
        arr[idx - 1] = "";
        onChange(arr.join(""));
        inputRefs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, "").slice(-1);
    if (!val) return;
    // digits là array — tạo array length OTP_LENGTH, fill từ digits
    const arr = Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] || "");
    arr[idx] = val;
    onChange(arr.join("").slice(0, OTP_LENGTH));
    if (idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onChange(pasted.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH));
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
  };

  return (
    <div className="otp-input-row">
      {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKey(e, idx)}
          onPaste={idx === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          className={`otp-input ${digits[idx] ? "filled" : ""} ${hasError ? "error" : ""}`}
        />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════
   VerifyOtpPage — 2 steps:
   step=1: nhập OTP
   step=2: nhập mật khẩu mới
═══════════════════════════════════════════ */
const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect nếu không có email
  useEffect(() => {
    if (!email) navigate("/auth/forgot-password", { replace: true });
  }, [email, navigate]);

  const [step, setStep] = useState(1); // 1 = OTP, 2 = new password, 3 = success
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Countdown resend
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    try {
      setResending(true);
      setError("");
      await sendOtp(email);
      setCountdown(RESEND_DELAY);
      setOtp("");
    } catch {
      setError("Không thể gửi lại OTP. Vui lòng thử lại.");
    } finally {
      setResending(false);
    }
  };

  /* Step 1: Verify OTP */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setError(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số.`);
      return;
    }
    try {
      setLoading(true);
      setError("");
      await verifyOtp(email, otp);
      setStep(2);
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 1006) setError("Mã OTP không đúng hoặc đã hết hạn.");
      else setError("Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2: Reset password */
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      setError("Mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await resetPassword(email, otp, newPass);
      setStep(3);
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 1006) {
        setError("OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
        setStep(1);
        setOtp("");
      } else {
        setError("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  /* ── Step 3: Success ── */
  if (step === 3) {
    return (
      <div className="auth-page">
        <div className="auth-bg-blob auth-bg-blob-1" />
        <div className="auth-bg-blob auth-bg-blob-2" />
        <div className="auth-card">
          <div className="auth-card-bar" />
          <div className="auth-card-body" style={{ textAlign: "center" }}>
            <div
              className="auth-success-icon"
              style={{ margin: "20px auto 20px" }}
            >
              <FiCheckCircle size={30} />
            </div>
            <h2
              style={{
                fontFamily: "'Merriweather', serif",
                fontSize: "1.15rem",
                color: "#0f1c35",
                marginBottom: 10,
              }}
            >
              Đặt lại mật khẩu thành công!
            </h2>
            <p
              style={{
                color: "#8a9ab8",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Mật khẩu của bạn đã được cập nhật.
              <br />
              Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <button
              className="auth-submit-btn"
              onClick={() => navigate("/auth/login")}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="auth-logo-title">
              {step === 1 ? "Nhập mã OTP" : "Mật khẩu mới"}
            </h1>
            <p className="auth-logo-subtitle">
              {step === 1
                ? `Mã OTP đã được gửi đến ${email}`
                : "Tạo mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          {/* Step badge */}
          <div style={{ textAlign: "center" }}>
            <span className="auth-step-badge">
              Bước {step + 1} / 3 —{" "}
              {step === 1 ? "Xác thực OTP" : "Đặt lại mật khẩu"}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: OTP ── */}
          {step === 1 && (
            <form onSubmit={handleVerify} noValidate>
              <div className="auth-form-group" style={{ textAlign: "center" }}>
                <label
                  className="auth-label"
                  style={{
                    textAlign: "center",
                    display: "block",
                    marginBottom: 16,
                  }}
                >
                  Nhập 6 chữ số OTP
                </label>
                <OtpInputRow
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    setError("");
                  }}
                  hasError={!!error}
                />
              </div>

              {/* Countdown */}
              <div className="otp-countdown">
                {countdown > 0 ? (
                  <>
                    Gửi lại mã sau <span className="timer">{countdown}s</span>
                  </>
                ) : (
                  <button
                    type="button"
                    className="auth-link"
                    onClick={handleResend}
                    disabled={resending}
                    style={{ background: "none", border: "none", padding: 0 }}
                  >
                    {resending ? "Đang gửi..." : "Gửi lại mã OTP"}
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || otp.length < OTP_LENGTH}
                style={{
                  marginTop: 20,
                  opacity: otp.length < OTP_LENGTH ? 0.55 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" /> Đang xác thực...
                  </>
                ) : (
                  "Xác nhận OTP"
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: New password ── */}
          {step === 2 && (
            <form onSubmit={handleReset} noValidate>
              <div className="auth-form-group">
                <label className="auth-label">Mật khẩu mới</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <FiLock size={15} />
                  </span>
                  <input
                    type={showPass ? "text" : "password"}
                    className={`auth-input with-both-icon ${error ? "error" : ""}`}
                    placeholder="Tối thiểu 8 ký tự"
                    value={newPass}
                    onChange={(e) => {
                      setNewPass(e.target.value);
                      setError("");
                    }}
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    onClick={() => setShowPass((s) => !s)}
                  >
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {/* Password strength hint */}
                {newPass && (
                  <p
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 5,
                      color: newPass.length >= 8 ? "#10b981" : "#ef4444",
                    }}
                  >
                    {newPass.length >= 8
                      ? "✓ Độ dài hợp lệ"
                      : `Cần thêm ${8 - newPass.length} ký tự`}
                  </p>
                )}
              </div>

              <div className="auth-form-group">
                <label className="auth-label">Xác nhận mật khẩu</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <FiLock size={15} />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    className={`auth-input with-both-icon ${error ? "error" : ""}`}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPass}
                    onChange={(e) => {
                      setConfirmPass(e.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-pass-toggle"
                    onClick={() => setShowConfirm((s) => !s)}
                  >
                    {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {confirmPass && newPass && (
                  <p
                    style={{
                      fontSize: "0.72rem",
                      marginTop: 5,
                      color: confirmPass === newPass ? "#10b981" : "#ef4444",
                    }}
                  >
                    {confirmPass === newPass
                      ? "✓ Mật khẩu khớp"
                      : "✗ Mật khẩu không khớp"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" /> Đang đặt lại...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>
          )}

          <div className="auth-link-row">
            <Link
              to="/auth/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                textDecoration: "none",
                color: "#1a6dc4",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              <FiArrowLeft size={14} /> Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
