import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiCamera,
  FiUser,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  getMyProfile,
  updateMyProfile,
} from "../../../services/admin/profileService";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const Field = ({ label, required, error, hint, children }) => (
  <div className="form-group-admin">
    <label className="form-label-admin">
      {label}
      {required && (
        <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>
      )}
    </label>
    {children}
    {hint && (
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: 4,
        }}
      >
        {hint}
      </p>
    )}
    {error && (
      <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 4 }}>
        {error}
      </p>
    )}
  </div>
);

const MyAccountEditPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [fetchLoad, setFetchLoad] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        const p = res?.result;
        setProfile(p);
        setForm({
          fullName: p?.fullName ?? "",
          phone: p?.phone ?? "",
          address: p?.address ?? "",
          password: "",
          confirmPassword: "",
        });
        if (p?.avatar) setAvatarPreview(p.avatar);
      })
      .catch(() => showToast("Không thể tải thông tin.", "error"))
      .finally(() => setFetchLoad(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập họ và tên";
    if (form.phone && !/^\d{10,11}$/.test(form.phone))
      errs.phone = "Số điện thoại không hợp lệ";
    if (form.password && form.password.length < 6)
      errs.password = "Mật khẩu tối thiểu 6 ký tự";
    if (form.password && form.password !== form.confirmPassword)
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
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
      const data = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        ...(form.password ? { password: form.password } : {}),
      };
      await updateMyProfile({ data, avatar: avatarFile || undefined });
      showToast("Cập nhật thông tin thành công!");
      setTimeout(() => navigate(`/${ADMIN}/my-account`), 1300);
    } catch (err) {
      showToast(err?.response?.data?.message || "Cập nhật thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = (profile?.fullName ||
    profile?.username ||
    "?")[0]?.toUpperCase();

  if (fetchLoad) {
    return (
      <div
        className="skeleton"
        style={{
          height: 400,
          borderRadius: "var(--radius-lg)",
          maxWidth: 600,
          margin: "0 auto",
        }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 3000,
            background:
              toast.type === "success"
                ? "var(--success-bg)"
                : "var(--danger-bg)",
            color:
              toast.type === "success" ? "var(--success)" : "var(--danger)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: "var(--radius-md)",
            padding: "12px 18px",
            fontSize: "0.875rem",
            fontWeight: 500,
            boxShadow: "var(--shadow-lg)",
            minWidth: 260,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/my-account`}>Tài khoản của tôi</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>Chỉnh sửa</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Chỉnh sửa thông tin</h1>
          <p className="page-subtitle">Cập nhật thông tin cá nhân của bạn</p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/my-account`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Avatar */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div style={{ position: "relative", marginBottom: 12 }}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--accent)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), #2e87e8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "2rem",
                  fontWeight: 700,
                }}
              >
                {avatarLetter}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent)",
                border: "2px solid var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <FiCamera size={13} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Click vào icon camera để đổi ảnh đại diện
          </span>
        </div>

        {/* Form fields */}
        <div className="form-section">
          <div className="form-section-header">
            <FiUser size={14} style={{ color: "var(--accent)" }} />
            <h3 className="form-section-title">Thông tin cá nhân</h3>
          </div>
          <div className="form-section-body">
            <Field label="Họ và tên" required error={errors.fullName}>
              <input
                name="fullName"
                className="form-control-admin"
                value={form.fullName}
                onChange={handleChange}
                style={errors.fullName ? { borderColor: "var(--danger)" } : {}}
              />
            </Field>

            {/* Username readonly */}
            <Field
              label="Tên đăng nhập"
              hint="Tên đăng nhập không thể thay đổi"
            >
              <input
                className="form-control-admin"
                value={profile?.username ?? ""}
                readOnly
                style={{
                  background: "var(--bg-raised)",
                  cursor: "not-allowed",
                  color: "var(--text-muted)",
                }}
              />
            </Field>

            <div className="form-row-2">
              <Field label="Số điện thoại" error={errors.phone}>
                <input
                  name="phone"
                  className="form-control-admin"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  style={errors.phone ? { borderColor: "var(--danger)" } : {}}
                />
              </Field>
              <div /> {/* spacer */}
            </div>

            <Field label="Địa chỉ">
              <input
                name="address"
                className="form-control-admin"
                value={form.address}
                onChange={handleChange}
                placeholder="Địa chỉ của bạn..."
              />
            </Field>
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="form-section">
          <div className="form-section-header">
            <FiAlertTriangle size={14} style={{ color: "var(--warning)" }} />
            <h3 className="form-section-title">
              Đổi mật khẩu{" "}
              <span
                style={{
                  fontWeight: 400,
                  color: "var(--text-muted)",
                  fontSize: "0.78rem",
                }}
              >
                (để trống nếu không đổi)
              </span>
            </h3>
          </div>
          <div className="form-section-body">
            <div className="form-row-2">
              <Field label="Mật khẩu mới" error={errors.password}>
                <input
                  name="password"
                  type="password"
                  className="form-control-admin"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={
                    errors.password ? { borderColor: "var(--danger)" } : {}
                  }
                />
              </Field>
              <Field label="Xác nhận mật khẩu" error={errors.confirmPassword}>
                <input
                  name="confirmPassword"
                  type="password"
                  className="form-control-admin"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={
                    errors.confirmPassword
                      ? { borderColor: "var(--danger)" }
                      : {}
                  }
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-submit-area">
          <button
            type="submit"
            className="btn-primary-admin"
            disabled={loading}
            style={{
              flex: 1,
              justifyContent: "center",
              padding: "12px 20px",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <>
                <div
                  className="spinner"
                  style={{ width: 16, height: 16, borderWidth: 2 }}
                />{" "}
                Đang lưu...
              </>
            ) : (
              <>
                <FiSave size={15} /> Lưu thay đổi
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/my-account`)}
            style={{ padding: "12px 16px" }}
          >
            <FiX size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyAccountEditPage;
