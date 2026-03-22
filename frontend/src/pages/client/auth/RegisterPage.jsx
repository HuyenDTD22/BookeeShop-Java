import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiPhone,
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { register } from "../../../services/client/clientAuthService";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import "../../../styles/client/client-auth.css";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useClientAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm: "",
    fullName: "",
    phone: "",
    address: "",
    gender: "MALE",
    dob: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.username))
      errs.username = "Email không hợp lệ";
    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập họ và tên";
    if (!form.password) errs.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 8)
      errs.password = "Mật khẩu tối thiểu 8 ký tự";
    if (!form.confirm) errs.confirm = "Vui lòng xác nhận mật khẩu";
    else if (form.confirm !== form.password)
      errs.confirm = "Mật khẩu xác nhận không khớp";
    if (!form.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    else if (!/^\d{10,11}$/.test(form.phone))
      errs.phone = "Số điện thoại không hợp lệ (10-11 số)";
    if (!form.address.trim()) errs.address = "Vui lòng nhập địa chỉ";
    if (!form.gender) errs.gender = "Vui lòng chọn giới tính";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      const payload = {
        username: form.username.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gender: form.gender,
        dob: form.dob || null,
      };
      await register(payload);
      setSuccess(true);
      // Tự động đăng nhập sau khi đăng ký
      setTimeout(async () => {
        try {
          await login(payload.username, form.password);
        } catch {
          navigate("/auth/login");
        }
      }, 1800);
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 1002)
        setApiError("Email này đã được đăng ký. Vui lòng dùng email khác.");
      else
        setApiError(
          err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
        );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-blob auth-bg-blob-1" />
        <div className="auth-bg-blob auth-bg-blob-2" />
        <div className="auth-card">
          <div className="auth-card-bar" />
          <div className="auth-card-body" style={{ textAlign: "center" }}>
            <div
              className="auth-success-icon"
              style={{ margin: "16px auto 20px" }}
            >
              <FiCheckCircle size={28} />
            </div>
            <h2
              style={{
                fontFamily: "'Merriweather', serif",
                fontSize: "1.1rem",
                color: "#0f1c35",
                marginBottom: 10,
              }}
            >
              Đăng ký thành công!
            </h2>
            <p
              style={{
                color: "#8a9ab8",
                fontSize: "0.875rem",
                lineHeight: 1.6,
              }}
            >
              Chào mừng bạn đến với BookeeShop.
              <br />
              Đang đăng nhập tự động...
            </p>
            <div style={{ marginTop: 20 }}>
              <span
                className="auth-spinner"
                style={{
                  borderColor: "rgba(26,109,196,0.2)",
                  borderTopColor: "#1a6dc4",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-blob auth-bg-blob-1" />
      <div className="auth-bg-blob auth-bg-blob-2" />

      <div className="auth-card wide">
        <div className="auth-card-bar" />
        <div className="auth-card-body">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FiBookOpen size={26} color="#fff" />
            </div>
            <h1 className="auth-logo-title">Tạo tài khoản</h1>
            <p className="auth-logo-subtitle">
              Tham gia BookeeShop để mua sắm dễ dàng hơn
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="auth-alert auth-alert-error">
              <FiAlertCircle
                size={16}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-form-group">
              <label className="auth-label">
                Email <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <FiMail size={15} />
                </span>
                <input
                  name="username"
                  type="email"
                  className={`auth-input with-left-icon ${errors.username ? "error" : ""}`}
                  placeholder="ten@email.com"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.username && (
                <p className="auth-field-error">
                  <FiAlertCircle size={12} />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Họ tên */}
            <div className="auth-form-group">
              <label className="auth-label">
                Họ và tên <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <FiUser size={15} />
                </span>
                <input
                  name="fullName"
                  type="text"
                  className={`auth-input with-left-icon ${errors.fullName ? "error" : ""}`}
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              {errors.fullName && (
                <p className="auth-field-error">
                  <FiAlertCircle size={12} />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Password + Confirm */}
            <div className="auth-row-2">
              <div className="auth-form-group">
                <label className="auth-label">
                  Mật khẩu <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <FiLock size={15} />
                  </span>
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    className={`auth-input with-both-icon ${errors.password ? "error" : ""}`}
                    placeholder="Tối thiểu 8 ký tự"
                    value={form.password}
                    onChange={handleChange}
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
                {errors.password && (
                  <p className="auth-field-error">
                    <FiAlertCircle size={12} />
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="auth-form-group">
                <label className="auth-label">
                  Xác nhận <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <FiLock size={15} />
                  </span>
                  <input
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    className={`auth-input with-both-icon ${errors.confirm ? "error" : ""}`}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirm}
                    onChange={handleChange}
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
                {errors.confirm && (
                  <p className="auth-field-error">
                    <FiAlertCircle size={12} />
                    {errors.confirm}
                  </p>
                )}
              </div>
            </div>

            {/* Phone + Gender */}
            <div className="auth-row-2">
              <div className="auth-form-group">
                <label className="auth-label">
                  Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <FiPhone size={15} />
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    className={`auth-input with-left-icon ${errors.phone ? "error" : ""}`}
                    placeholder="0912345678"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && (
                  <p className="auth-field-error">
                    <FiAlertCircle size={12} />
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="auth-form-group">
                <label className="auth-label">
                  Giới tính <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="gender"
                  className={`auth-input ${errors.gender ? "error" : ""}`}
                  value={form.gender}
                  onChange={handleChange}
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="auth-field-error">
                    <FiAlertCircle size={12} />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="auth-form-group">
              <label className="auth-label">
                Địa chỉ <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className="auth-input-wrap">
                <span
                  className="auth-input-icon"
                  style={{ top: 14, transform: "none" }}
                >
                  <FiMapPin size={15} />
                </span>
                <input
                  name="address"
                  type="text"
                  className={`auth-input with-left-icon ${errors.address ? "error" : ""}`}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
              {errors.address && (
                <p className="auth-field-error">
                  <FiAlertCircle size={12} />
                  {errors.address}
                </p>
              )}
            </div>

            {/* DOB (optional) */}
            <div className="auth-form-group">
              <label className="auth-label">
                Ngày sinh{" "}
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#8a9ab8",
                    textTransform: "none",
                    letterSpacing: 0,
                    fontWeight: 400,
                  }}
                >
                  (không bắt buộc)
                </span>
              </label>
              <input
                name="dob"
                type="date"
                className="auth-input"
                value={form.dob}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" /> Đang tạo tài khoản...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </form>

          <div className="auth-link-row">
            Đã có tài khoản? <Link to="/auth/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
