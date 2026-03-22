import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiUpload,
  FiUser,
  FiLock,
  FiShield,
  FiPhone,
} from "react-icons/fi";
import {
  createStaff,
  updateStaff,
  getStaffById,
  getRoles,
} from "../../../services/admin/staffService";
import "../../../styles/admin/customer.css";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Avatar Upload ── */
const AvatarUpload = ({ preview, onChange, onRemove }) => {
  const inputRef = useRef();
  return (
    <div style={{ textAlign: "center" }}>
      {preview ? (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img
            src={preview}
            alt=""
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          />
          <button
            type="button"
            onClick={onRemove}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--danger)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX size={12} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a6dc4, #7c3aed)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: "0 auto",
            border: "3px dashed rgba(124,58,237,0.3)",
            transition: "opacity var(--transition)",
          }}
        >
          <FiUpload size={20} color="#fff" />
          <span
            style={{
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.8)",
              marginTop: 4,
            }}
          >
            Tải ảnh lên
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files[0];
          if (f) onChange(f);
        }}
      />
      <p
        style={{
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          marginTop: 8,
        }}
      >
        Ảnh đại diện (tuỳ chọn)
      </p>
    </div>
  );
};

/* ── Field ── */
const Field = ({ label, required, error, children }) => (
  <div className="form-group-admin">
    <label className="form-label-admin">
      {label}
      {required && (
        <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>
      )}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 4 }}>
        {error}
      </p>
    )}
  </div>
);

/* ══════════════════════════════════════════
   StaffFormPage — Create & Edit
═══════════════════════════════════════════ */
const StaffFormPage = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    gender: "MALE",
    phone: "",
    address: "",
    dob: "",
    roles: [],
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load all roles — chỉ lấy STAFF_, hiển thị displayName */
  useEffect(() => {
    getRoles()
      .then((res) => {
        const data = res?.result ?? [];
        // Lọc chỉ giữ role nhân viên (STAFF_), bỏ ADMIN và USER
        const staffRoles = (Array.isArray(data) ? data : []).filter((r) =>
          r.name?.startsWith("STAFF_"),
        );
        setAllRoles(staffRoles);
      })
      .catch(() => {});
  }, []);

  /* Load staff data for edit */
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetchLoading(true);
    getStaffById(id)
      .then((res) => {
        const s = res.result;
        setForm({
          username: s.username ?? "",
          password: "",
          fullName: s.fullName ?? "",
          gender: s.gender ?? "MALE",
          phone: s.phone ?? "",
          address: s.address ?? "",
          dob: s.dob ?? "",
          roles: s.roles?.map((r) => r.id) ?? [],
        });
        if (s.avatar) setPreview(s.avatar);
      })
      .catch(() => showToast("Không thể tải thông tin nhân viên", "error"))
      .finally(() => setFetchLoading(false));
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoleToggle = (roleId) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((id) => id !== roleId)
        : [...prev.roles, roleId],
    }));
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập họ tên";
    if (!isEdit && !form.username.trim())
      errs.username = "Vui lòng nhập tên đăng nhập";
    if (!isEdit && !form.password) errs.password = "Vui lòng nhập mật khẩu";
    if (!isEdit && form.password && form.password.length < 8)
      errs.password = "Mật khẩu tối thiểu 8 ký tự";
    if (!form.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    if (!/^\d{10,11}$/.test(form.phone))
      errs.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    if (!form.address.trim()) errs.address = "Vui lòng nhập địa chỉ";
    if (!form.roles.length) errs.roles = "Vui lòng chọn ít nhất một vai trò";
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
      if (isEdit) {
        const data = {
          fullName: form.fullName.trim(),
          gender: form.gender,
          phone: form.phone.trim(),
          address: form.address.trim(),
          ...(form.dob && { dob: form.dob }),
          ...(form.password && { password: form.password }),
          ...(form.roles.length && { roles: form.roles }),
        };
        await updateStaff(id, { data, avatar });
        showToast("Cập nhật nhân viên thành công!");
      } else {
        const data = {
          username: form.username.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          gender: form.gender,
          phone: form.phone.trim(),
          address: form.address.trim(),
          ...(form.dob && { dob: form.dob }),
          roles: form.roles,
        };
        await createStaff({ data, avatar });
        showToast("Thêm nhân viên mới thành công!");
      }
      setTimeout(() => navigate(`/${ADMIN}/staff`), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      showToast(
        msg || (isEdit ? "Cập nhật thất bại" : "Thêm nhân viên thất bại"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}
      >
        {[480, 300].map((h, i) => (
          <div
            key={i}
            style={{
              height: h,
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div className="skeleton" style={{ height: "100%" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
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
            animation: "fadeIn 0.25s ease",
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
        <Link to={`/${ADMIN}/staff`}>Quản lý nhân sự</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? "Cập nhật thông tin tài khoản nhân viên"
              : "Tạo tài khoản nhân viên mới"}
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/staff`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── LEFT ── */}
          <div>
            {/* Thông tin cơ bản */}
            <div className="form-section">
              <div className="form-section-header">
                <FiUser size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thông tin cơ bản</h3>
              </div>
              <div className="form-section-body">
                <div className="form-row-2">
                  <Field label="Họ và tên" required error={errors.fullName}>
                    <input
                      name="fullName"
                      className="form-control-admin"
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={handleChange}
                      style={
                        errors.fullName ? { borderColor: "var(--danger)" } : {}
                      }
                    />
                  </Field>
                  <Field label="Giới tính">
                    <select
                      name="gender"
                      className="form-control-admin"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </Field>
                </div>

                <div className="form-row-2">
                  <Field label="Số điện thoại" required error={errors.phone}>
                    <input
                      name="phone"
                      className="form-control-admin"
                      placeholder="0912345678"
                      value={form.phone}
                      onChange={handleChange}
                      style={
                        errors.phone ? { borderColor: "var(--danger)" } : {}
                      }
                    />
                  </Field>
                  <Field label="Ngày sinh">
                    <input
                      name="dob"
                      type="date"
                      className="form-control-admin"
                      value={form.dob}
                      onChange={handleChange}
                    />
                  </Field>
                </div>

                <Field label="Địa chỉ" required error={errors.address}>
                  <input
                    name="address"
                    className="form-control-admin"
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    value={form.address}
                    onChange={handleChange}
                    style={
                      errors.address ? { borderColor: "var(--danger)" } : {}
                    }
                  />
                </Field>
              </div>
            </div>

            {/* Tài khoản */}
            <div className="form-section">
              <div className="form-section-header">
                <FiLock size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Tài khoản đăng nhập</h3>
              </div>
              <div className="form-section-body">
                <div className="form-row-2">
                  <Field
                    label="Tên đăng nhập"
                    required={!isEdit}
                    error={errors.username}
                  >
                    <input
                      name="username"
                      className="form-control-admin"
                      placeholder="staff_username"
                      value={form.username}
                      onChange={handleChange}
                      disabled={isEdit}
                      style={{
                        ...(errors.username
                          ? { borderColor: "var(--danger)" }
                          : {}),
                        ...(isEdit
                          ? { opacity: 0.6, cursor: "not-allowed" }
                          : {}),
                      }}
                    />
                  </Field>
                  <Field
                    label={
                      isEdit
                        ? "Mật khẩu mới (để trống nếu không đổi)"
                        : "Mật khẩu"
                    }
                    required={!isEdit}
                    error={errors.password}
                  >
                    <input
                      name="password"
                      type="password"
                      className="form-control-admin"
                      placeholder={
                        isEdit ? "Nhập mật khẩu mới..." : "Tối thiểu 8 ký tự"
                      }
                      value={form.password}
                      onChange={handleChange}
                      style={
                        errors.password ? { borderColor: "var(--danger)" } : {}
                      }
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Phân quyền — hiển thị displayName */}
            <div className="form-section">
              <div className="form-section-header">
                <FiShield size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Phân quyền</h3>
              </div>
              <div className="form-section-body">
                {errors.roles && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--danger)",
                      marginBottom: 10,
                    }}
                  >
                    {errors.roles}
                  </p>
                )}
                {allRoles.length === 0 ? (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      fontSize: "0.875rem",
                    }}
                  >
                    Chưa có vai trò nhân viên nào. Vui lòng tạo vai trò trước.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {allRoles.map((role) => (
                      <label
                        key={role.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          border: `1px solid ${form.roles.includes(role.id) ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: "var(--radius-sm)",
                          background: form.roles.includes(role.id)
                            ? "var(--accent-bg)"
                            : "var(--bg-raised)",
                          cursor: "pointer",
                          transition: "all var(--transition)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.roles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          style={{ accentColor: "var(--accent)" }}
                        />
                        <div>
                          {/* Hiển thị displayName thay vì name */}
                          <div
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {role.displayName}
                          </div>
                          {/* Hiển thị name (kỹ thuật) nhỏ bên dưới để tham khảo */}
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              marginTop: 2,
                              fontFamily: "monospace",
                            }}
                          >
                            {role.name}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div>
            {/* Avatar */}
            <div className="form-section">
              <div className="form-section-header">
                <FiUpload size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Ảnh đại diện</h3>
              </div>
              <div className="form-section-body">
                <AvatarUpload
                  preview={preview}
                  onChange={(file) => {
                    setAvatar(file);
                    setPreview(URL.createObjectURL(file));
                  }}
                  onRemove={() => {
                    setAvatar(null);
                    setPreview("");
                  }}
                />
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
                  cursor: loading ? "not-allowed" : "pointer",
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
                    <FiSave size={15} />{" "}
                    {isEdit ? "Lưu thay đổi" : "Thêm nhân viên"}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary-admin"
                onClick={() => navigate(`/${ADMIN}/staff`)}
                style={{ padding: "12px 16px" }}
                title="Hủy"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StaffFormPage;
