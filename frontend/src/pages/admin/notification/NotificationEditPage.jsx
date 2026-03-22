import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiBell,
  FiUsers,
  FiClock,
} from "react-icons/fi";
import {
  getNotificationById,
  updateNotification,
} from "../../../services/admin/notificationService";
import {
  NOTIF_TYPE_LABEL,
  NOTIF_STATUS_LABEL,
  NOTIF_STATUS_CLASS,
  NOTIF_STATUS_ICON,
} from "./notificationConstants";
import "../../../styles/admin/notification.css";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Quill config ── */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
    [{ color: [] }, { background: [] }],
  ],
};
const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "link",
  "color",
  "background",
];

/* ── Quill Editor ── */
const QuillEditor = ({ value, onChange, placeholder }) => {
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: QUILL_MODULES,
    formats: QUILL_FORMATS,
    placeholder: placeholder || "Nhập nội dung...",
  });
  const initializedRef = useRef(false);

  useEffect(() => {
    if (quill && value && !initializedRef.current) {
      quill.clipboard.dangerouslyPasteHTML(value);
      initializedRef.current = true;
    }
  }, [quill, value]);

  useEffect(() => {
    if (!quill) return;
    const handler = () => {
      const html = quill.root.innerHTML;
      onChange(html === "<p><br></p>" ? "" : html);
    };
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [quill, onChange]);

  return (
    <div className="quill-wrapper">
      <div ref={quillRef} />
    </div>
  );
};

/* ── Field ── */
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

/* ══════════════════════════════════════════
   NotificationEditPage
═══════════════════════════════════════════ */
const NotificationEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "ANNOUNCEMENT",
    audienceType: "ALL",
    targetRole: "",
    scheduledAt: "",
  });
  const [mode, setMode] = useState("now"); // "now" | "scheduled"
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load thông báo gốc */
  useEffect(() => {
    getNotificationById(id)
      .then((res) => {
        const n = res.result;

        // Chỉ cho sửa DRAFT hoặc SCHEDULED
        if (n.status === "SENT" || n.status === "CANCELLED") {
          // Không redirect ngay — để component render rồi hiện error
          setOriginal({ ...n, _immutable: true });
          setFetchLoading(false);
          return;
        }

        setOriginal(n);
        setForm({
          title: n.title ?? "",
          content: n.content ?? "",
          type: n.type ?? "ANNOUNCEMENT",
          audienceType: n.audienceType ?? "ALL",
          targetRole: n.targetRole ?? "",
          scheduledAt: n.scheduledAt
            ? n.scheduledAt.slice(0, 16) // "yyyy-MM-ddTHH:mm"
            : "",
        });
        setMode(n.scheduledAt ? "scheduled" : "now");
      })
      .catch(() => showToast("Không thể tải thông tin thông báo.", "error"))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleContentChange = (html) => {
    setForm((prev) => ({ ...prev, content: html }));
    if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (!form.content.trim()) errs.content = "Vui lòng nhập nội dung";
    if (form.audienceType === "BY_ROLE" && !form.targetRole.trim())
      errs.targetRole = "Vui lòng nhập tên role";
    if (mode === "scheduled" && !form.scheduledAt)
      errs.scheduledAt = "Vui lòng chọn thời gian gửi";
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
      const payload = {
        title: form.title.trim(),
        content: form.content,
        type: form.type,
        audienceType: form.audienceType,
        ...(form.audienceType === "BY_ROLE" && {
          targetRole: form.targetRole.trim(),
        }),
        // Nếu đổi từ scheduled → now: removeSchedule = true
        ...(mode === "now" && original?.scheduledAt
          ? { removeSchedule: true }
          : {}),
        // Nếu đang scheduled: gửi scheduledAt mới
        ...(mode === "scheduled" && form.scheduledAt
          ? { scheduledAt: form.scheduledAt }
          : {}),
      };
      await updateNotification(id, payload);
      showToast("Cập nhật thông báo thành công!");
      setTimeout(() => navigate(`/${ADMIN}/notification/detail/${id}`), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      showToast(msg || "Cập nhật thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = (() => {
    const d = new Date(Date.now() + 60000);
    return d.toISOString().slice(0, 16);
  })();

  if (fetchLoading) {
    return (
      <div className="notif-form-layout">
        {[420, 280].map((h, i) => (
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

  if (!original) return null;

  // Thông báo đã gửi/hủy - không cho sửa, hiển thị thông báo lỗi
  if (original._immutable) {
    return (
      <div>
        <div className="breadcrumb-nav">
          <Link to={`/${ADMIN}/notification`}>Quản lý thông báo</Link>
          <span className="breadcrumb-sep">›</span>
          <Link to={`/${ADMIN}/notification/detail/${id}`}>
            {original.title}
          </Link>
          <span className="breadcrumb-sep">›</span>
          <span style={{ color: "var(--text-primary)" }}>Chỉnh sửa</span>
        </div>
        <div
          className="alert-admin animate-fadeIn"
          style={{
            margin: "24px 0",
            background: "var(--danger-bg)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          ⚠ Thông báo đã được gửi hoặc đã hủy — không thể chỉnh sửa.
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/notification/detail/${id}`)}
        >
          <FiArrowLeft size={14} /> Quay lại chi tiết
        </button>
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
        <Link to={`/${ADMIN}/notification`}>Quản lý thông báo</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/${ADMIN}/notification/detail/${id}`}>{original.title}</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>Chỉnh sửa</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Chỉnh sửa thông báo</h1>
          <p className="page-subtitle">
            Trạng thái hiện tại:{" "}
            <span
              className={`notif-status-badge ${NOTIF_STATUS_CLASS[original.status]}`}
              style={{ fontSize: "0.78rem" }}
            >
              {NOTIF_STATUS_ICON[original.status]}{" "}
              {NOTIF_STATUS_LABEL[original.status]}
            </span>
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/notification/detail/${id}`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="notif-form-layout">
          {/* ── LEFT ── */}
          <div>
            {/* Nội dung */}
            <div className="form-section">
              <div className="form-section-header">
                <FiBell size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Nội dung thông báo</h3>
              </div>
              <div className="form-section-body">
                <Field label="Tiêu đề" required error={errors.title}>
                  <input
                    name="title"
                    className="form-control-admin"
                    placeholder="Nhập tiêu đề thông báo..."
                    value={form.title}
                    onChange={handleChange}
                    style={errors.title ? { borderColor: "var(--danger)" } : {}}
                  />
                </Field>
                <div className="form-group-admin">
                  <label className="form-label-admin">
                    Nội dung{" "}
                    <span style={{ color: "var(--danger)", marginLeft: 2 }}>
                      *
                    </span>
                  </label>
                  <QuillEditor
                    value={form.content}
                    onChange={handleContentChange}
                    placeholder="Nhập nội dung thông báo..."
                  />
                  {errors.content && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--danger)",
                        marginTop: 4,
                      }}
                    >
                      {errors.content}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Đối tượng */}
            <div className="form-section">
              <div className="form-section-header">
                <FiUsers size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Đối tượng nhận</h3>
              </div>
              <div className="form-section-body">
                <div className="form-row-2">
                  <Field label="Loại thông báo">
                    <select
                      name="type"
                      className="form-control-admin"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="ANNOUNCEMENT">📢 Thông báo chung</option>
                      <option value="PROMOTION">🎁 Khuyến mãi</option>
                      <option value="SYSTEM">⚙️ Hệ thống nội bộ</option>
                    </select>
                  </Field>
                  <Field label="Đối tượng">
                    <select
                      name="audienceType"
                      className="form-control-admin"
                      value={form.audienceType}
                      onChange={handleChange}
                    >
                      <option value="ALL">👥 Tất cả người dùng</option>
                      <option value="BY_ROLE">🏷️ Theo vai trò</option>
                    </select>
                  </Field>
                </div>
                {form.audienceType === "BY_ROLE" && (
                  <Field label="Tên Role" required error={errors.targetRole}>
                    <input
                      name="targetRole"
                      className="form-control-admin"
                      placeholder="Ví dụ: USER, STAFF_MANAGER..."
                      value={form.targetRole}
                      onChange={handleChange}
                      style={
                        errors.targetRole
                          ? { borderColor: "var(--danger)" }
                          : {}
                      }
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div>
            {/* Thời gian */}
            <div className="form-section">
              <div className="form-section-header">
                <FiClock size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thời gian gửi</h3>
              </div>
              <div className="form-section-body">
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  {[
                    { val: "now", label: "🚀 Gửi ngay" },
                    { val: "scheduled", label: "🕐 Lên lịch" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMode(val)}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: `2px solid ${mode === val ? "var(--accent)" : "var(--border)"}`,
                        background:
                          mode === val
                            ? "var(--accent-bg)"
                            : "var(--bg-surface)",
                        color:
                          mode === val
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                        fontWeight: mode === val ? 700 : 400,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        transition: "all var(--transition)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {mode === "now" ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--success-bg)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                      color: "var(--success)",
                      fontWeight: 500,
                    }}
                  >
                    ✅ Thông báo sẽ được gửi ngay sau khi lưu
                  </div>
                ) : (
                  <Field
                    label="Thời gian gửi"
                    required
                    error={errors.scheduledAt}
                  >
                    <input
                      name="scheduledAt"
                      type="datetime-local"
                      className="form-control-admin"
                      value={form.scheduledAt}
                      min={minDateTime}
                      onChange={handleChange}
                      style={
                        errors.scheduledAt
                          ? { borderColor: "var(--danger)" }
                          : {}
                      }
                    />
                  </Field>
                )}
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
                    <FiSave size={15} /> Lưu thay đổi
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary-admin"
                onClick={() => navigate(`/${ADMIN}/notification/detail/${id}`)}
                style={{ padding: "12px 16px" }}
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

export default NotificationEditPage;
