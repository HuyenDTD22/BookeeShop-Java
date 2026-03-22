import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import {
  FiArrowLeft,
  FiSave,
  FiSend,
  FiX,
  FiBell,
  FiUsers,
  FiClock,
  FiSearch,
} from "react-icons/fi";
import { createNotification } from "../../../services/admin/notificationService";
import { getRoles } from "../../../services/admin/roleService";
import httpClient from "../../../utils/httpClient";
import "../../../styles/admin/notification.css";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN_ROUTE || "admin";
const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";

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
    placeholder: placeholder || "Nhập nội dung thông báo...",
  });
  const initRef = useRef(false);

  useEffect(() => {
    if (quill && value && !initRef.current) {
      quill.clipboard.dangerouslyPasteHTML(value);
      initRef.current = true;
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

/* ── User Search (cho SPECIFIC_USERS) ── */
const UserSearchSelect = ({ selectedUsers, onAdd, onRemove }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const wrapRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await httpClient.get(`/${ADMIN_PREFIX}/users/customer`, {
        params: { keyword: q, size: 10, page: 0 },
      });
      setResults(res.data?.result?.content ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 350);
    return () => clearTimeout(t);
  }, [query, search]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setShowDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const alreadySelected = (id) => selectedUsers.some((u) => u.id === id);

  return (
    <div>
      <div className="user-search-wrap" ref={wrapRef}>
        <FiSearch size={14} className="user-search-icon" />
        <input
          className="user-search-input"
          placeholder="Tìm theo tên, số điện thoại..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDrop(true);
          }}
          onFocus={() => setShowDrop(true)}
        />
        {showDrop && (query.trim() || results.length > 0) && (
          <div className="user-search-dropdown">
            {loading ? (
              <div
                style={{
                  padding: "10px 14px",
                  color: "var(--text-muted)",
                  fontSize: "0.82rem",
                }}
              >
                Đang tìm...
              </div>
            ) : results.length === 0 ? (
              <div
                style={{
                  padding: "10px 14px",
                  color: "var(--text-muted)",
                  fontSize: "0.82rem",
                }}
              >
                Không tìm thấy
              </div>
            ) : (
              results.map((user) => (
                <div
                  key={user.id}
                  className="user-search-item"
                  style={{ opacity: alreadySelected(user.id) ? 0.45 : 1 }}
                  onClick={() => {
                    if (!alreadySelected(user.id)) {
                      onAdd(user);
                      setQuery("");
                      setShowDrop(false);
                    }
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, var(--accent), #2e87e8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(user.fullName || user.username || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {user.fullName || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      @{user.username}
                    </div>
                  </div>
                  {alreadySelected(user.id) && (
                    <span
                      style={{ fontSize: "0.72rem", color: "var(--success)" }}
                    >
                      ✓ Đã chọn
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selectedUsers.length > 0 && (
        <div className="selected-users-wrap">
          {selectedUsers.map((u) => (
            <span key={u.id} className="selected-user-tag">
              {u.fullName || u.username}
              <button type="button" onClick={() => onRemove(u.id)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {selectedUsers.length === 0 && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: 8,
          }}
        >
          Chưa có người dùng nào được chọn
        </p>
      )}
    </div>
  );
};

/* ── Role list (cho BY_ROLE) ── */
const RoleSelect = ({ value, onChange }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoles()
      .then((res) => {
        // GET /admin/roles trả về List<RoleResponse> (không phân trang)
        const data = res?.result ?? [];
        // Chỉ hiển thị role STAFF_ để admin gán cho thông báo nội bộ
        setRoles(Array.isArray(data) ? data : []);
      })
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <select
      className="form-control-admin"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- Chọn vai trò --</option>
      {loading ? (
        <option disabled>Đang tải...</option>
      ) : (
        roles.map((r) => (
          <option key={r.id} value={r.name}>
            {r.displayName}
          </option>
        ))
      )}
    </select>
  );
};

/* ══════════════════════════════════════════
   NotificationCreatePage
═══════════════════════════════════════════ */
const NotificationCreatePage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "ANNOUNCEMENT",
    audienceType: "ALL",
    targetRole: "",
    scheduledAt: "",
  });
  // Cho SPECIFIC_USERS: lưu array { id, fullName, username }
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sendMode, setSendMode] = useState("now"); // "now" | "scheduled" | "draft"
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tiêu đề";
    if (!form.content.trim()) errs.content = "Vui lòng nhập nội dung";
    if (form.audienceType === "BY_ROLE" && !form.targetRole.trim())
      errs.targetRole = "Vui lòng chọn vai trò";
    if (form.audienceType === "SPECIFIC_USERS" && selectedUsers.length === 0)
      errs.targetUsers = "Vui lòng chọn ít nhất 1 người dùng";
    if (sendMode === "scheduled" && !form.scheduledAt)
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
        ...(form.audienceType === "BY_ROLE" && { targetRole: form.targetRole }),
        ...(form.audienceType === "SPECIFIC_USERS" && {
          targetUserIds: selectedUsers.map((u) => u.id),
        }),
        // Gửi ngay: không scheduledAt → backend set SENT ngay
        // Lên lịch: có scheduledAt → backend set SCHEDULED
        // Draft: thêm flag isDraft → backend set DRAFT (xem note bên dưới)
        ...(sendMode === "scheduled" &&
          form.scheduledAt && { scheduledAt: form.scheduledAt }),
        ...(sendMode === "draft" && { isDraft: true }),
      };

      await createNotification(payload);
      showToast(
        sendMode === "draft"
          ? "Đã lưu bản nháp thành công!"
          : sendMode === "scheduled"
            ? "Đã lên lịch gửi thông báo!"
            : "Đã gửi thông báo thành công!",
      );
      setTimeout(() => navigate(`/${ADMIN}/notification`), 1300);
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Tạo thông báo thất bại.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  const SEND_MODES = [
    { val: "now", label: "🚀 Gửi ngay", desc: "Gửi ngay đến người nhận" },
    { val: "scheduled", label: "🕐 Lên lịch", desc: "Chọn thời gian gửi" },
    { val: "draft", label: "📝 Bản nháp", desc: "Lưu để gửi sau" },
  ];

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
        <span style={{ color: "var(--text-primary)" }}>Tạo thông báo mới</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tạo thông báo mới</h1>
          <p className="page-subtitle">
            Soạn thảo và gửi thông báo đến người dùng
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/notification`)}
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
                    onChange={(html) => {
                      setForm((p) => ({ ...p, content: html }));
                      if (errors.content)
                        setErrors((p) => ({ ...p, content: "" }));
                    }}
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
                <h3 className="form-section-title">Loại & Đối tượng nhận</h3>
              </div>
              <div className="form-section-body">
                <div className="form-row-2">
                  {/* Loại thông báo */}
                  <Field label="Loại thông báo" required>
                    <select
                      name="type"
                      className="form-control-admin"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="ANNOUNCEMENT">📢 Thông báo chung</option>
                      <option value="PROMOTION">🎁 Khuyến mãi</option>
                      <option value="FLASH_SALE">⚡ Flash Sale</option>
                      <option value="SYSTEM">⚙️ Hệ thống nội bộ</option>
                    </select>
                  </Field>

                  {/* Đối tượng */}
                  <Field label="Đối tượng nhận" required>
                    <select
                      name="audienceType"
                      className="form-control-admin"
                      value={form.audienceType}
                      onChange={(e) => {
                        handleChange(e);
                        setSelectedUsers([]);
                        setForm((p) => ({ ...p, targetRole: "" }));
                      }}
                    >
                      <option value="ALL">👥 Tất cả người dùng</option>
                      <option value="CUSTOMERS">🛒 Khách hàng</option>
                      <option value="STAFF">👔 Nhân viên</option>
                      <option value="BY_ROLE">🏷️ Theo vai trò</option>
                      <option value="SPECIFIC_USERS">
                        👤 Người dùng cụ thể
                      </option>
                    </select>
                  </Field>
                </div>

                {/* BY_ROLE → chọn role từ dropdown */}
                {form.audienceType === "BY_ROLE" && (
                  <Field
                    label="Chọn vai trò"
                    required
                    error={errors.targetRole}
                  >
                    <RoleSelect
                      value={form.targetRole}
                      onChange={(val) => {
                        setForm((p) => ({ ...p, targetRole: val }));
                        if (errors.targetRole)
                          setErrors((p) => ({ ...p, targetRole: "" }));
                      }}
                    />
                  </Field>
                )}

                {/* SPECIFIC_USERS → search & select */}
                {form.audienceType === "SPECIFIC_USERS" && (
                  <Field
                    label="Tìm và chọn người dùng"
                    required
                    error={errors.targetUsers}
                  >
                    <UserSearchSelect
                      selectedUsers={selectedUsers}
                      onAdd={(user) =>
                        setSelectedUsers((prev) => [...prev, user])
                      }
                      onRemove={(id) =>
                        setSelectedUsers((prev) =>
                          prev.filter((u) => u.id !== id),
                        )
                      }
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div>
            {/* Chế độ gửi */}
            <div className="form-section">
              <div className="form-section-header">
                <FiClock size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thời gian gửi</h3>
              </div>
              <div className="form-section-body">
                {/* 3 nút toggle */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {SEND_MODES.map(({ val, label, desc }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSendMode(val)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: `2px solid ${sendMode === val ? "var(--accent)" : "var(--border)"}`,
                        background:
                          sendMode === val
                            ? "var(--accent-bg)"
                            : "var(--bg-surface)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all var(--transition)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: sendMode === val ? 700 : 500,
                          color:
                            sendMode === val
                              ? "var(--accent)"
                              : "var(--text-primary)",
                          fontSize: "0.875rem",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>

                {sendMode === "scheduled" && (
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
                {sendMode === "draft" && (
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    📝 Thông báo sẽ được lưu dưới dạng bản nháp, chưa gửi đến
                    ai.
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="form-section">
              <div className="form-section-header">
                <FiBell size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Xem trước</h3>
              </div>
              <div className="form-section-body">
                <div
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      marginBottom: 8,
                    }}
                  >
                    {form.title || (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Chưa có tiêu đề
                      </span>
                    )}
                  </div>
                  {form.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: form.content }}
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        maxHeight: 100,
                        overflow: "hidden",
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Chưa có nội dung
                    </p>
                  )}
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
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <div
                      className="spinner"
                      style={{ width: 16, height: 16, borderWidth: 2 }}
                    />{" "}
                    Đang xử lý...
                  </>
                ) : sendMode === "draft" ? (
                  <>
                    <FiSave size={15} /> Lưu bản nháp
                  </>
                ) : sendMode === "scheduled" ? (
                  <>
                    <FiClock size={15} /> Lên lịch gửi
                  </>
                ) : (
                  <>
                    <FiSend size={15} /> Gửi thông báo
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary-admin"
                onClick={() => navigate(`/${ADMIN}/notification`)}
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

export default NotificationCreatePage;
