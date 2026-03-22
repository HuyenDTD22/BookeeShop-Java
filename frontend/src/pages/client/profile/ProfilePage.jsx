import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCamera,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
} from "../../../services/client/profileService";
import "../../../styles/client/profile.css";

/* ── helpers ── */
const fmtDate = (str) => {
  if (!str) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(str));
};

const GENDERS = [
  { value: "", label: "Chưa cập nhật" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const genderLabel = (v) =>
  GENDERS.find((g) => g.value === (v ?? ""))?.label ?? "Chưa cập nhật";

/* ═══════════════════════════════════════════════════════════════
   Toast
═══════════════════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`pf-toast${toast.type === "error" ? " error" : ""}`}>
      {toast.type === "error" ? (
        <FiAlertCircle size={15} />
      ) : (
        <FiCheckCircle size={15} />
      )}
      {toast.msg}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ProfilePage
═══════════════════════════════════════════════════════════════ */
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  /* form state */
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({});

  /* avatar */
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef();

  /* password tab */
  const [pwForm, setPwForm] = useState({ old: "", newPw: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // "info" | "password"

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Load profile ── */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyProfile();
      const p = res?.result ?? {};
      setProfile(p);
      setForm({
        fullName: p.fullName ?? "",
        dob: p.dob ?? "",
        gender: p.gender ?? "",
        phone: p.phone ?? "",
        address: p.address ?? "",
      });
    } catch {
      showToast("Không thể tải thông tin cá nhân.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ── Avatar pick ── */
  const handleAvatarPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ── Start edit ── */
  const handleStartEdit = () => {
    setForm({
      fullName: profile?.fullName ?? "",
      dob: profile?.dob ?? "",
      gender: profile?.gender ?? "",
      phone: profile?.phone ?? "",
      address: profile?.address ?? "",
    });
    setAvatarFile(null);
    setAvatarPreview("");
    setFormErrors({});
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview("");
    setFormErrors({});
  };

  /* ── Validate profile form ── */
  const validateForm = () => {
    const e = {};
    if (form.phone && !/^\d{10,11}$/.test(form.phone.trim())) {
      e.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }
    if (form.dob) {
      const age =
        (Date.now() - new Date(form.dob).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);
      if (age < 10) e.dob = "Tuổi phải từ 10 trở lên";
    }
    return e;
  };

  /* ── Save profile ── */
  const handleSave = async () => {
    const e = validateForm();
    if (Object.keys(e).length) {
      setFormErrors(e);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        fullName: form.fullName.trim() || null,
        dob: form.dob || null,
        gender: form.gender || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      };
      const res = await updateMyProfile(payload, avatarFile);
      const updated = res?.result ?? {};
      setProfile(updated);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview("");
      showToast("Cập nhật thông tin thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.includes("PHONE_INVALID"))
        showToast("Số điện thoại không hợp lệ.", "error");
      else if (msg.includes("INVALID_DOB"))
        showToast("Ngày sinh không hợp lệ.", "error");
      else showToast("Cập nhật thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Validate password ── */
  const validatePw = () => {
    const e = {};
    if (!pwForm.old.trim()) e.old = "Vui lòng nhập mật khẩu hiện tại";
    if (!pwForm.newPw.trim()) e.newPw = "Vui lòng nhập mật khẩu mới";
    else if (pwForm.newPw.length < 8) e.newPw = "Mật khẩu mới ít nhất 8 ký tự";
    if (pwForm.newPw !== pwForm.confirm)
      e.confirm = "Mật khẩu xác nhận không khớp";
    return e;
  };

  /* ── Change password ── */
  const handleChangePw = async () => {
    const e = validatePw();
    if (Object.keys(e).length) {
      setPwErrors(e);
      return;
    }

    try {
      setPwSaving(true);
      await changePassword(pwForm.old, pwForm.newPw);
      setPwForm({ old: "", newPw: "", confirm: "" });
      setPwErrors({});
      showToast("Đổi mật khẩu thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message ?? "";
      if (
        msg.includes("INVALID_OLD_PASSWORD") ||
        msg.includes("INVALID_PASSWORD")
      ) {
        setPwErrors({ old: "Mật khẩu hiện tại không đúng" });
      } else {
        showToast("Đổi mật khẩu thất bại.", "error");
      }
    } finally {
      setPwSaving(false);
    }
  };

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="pf-page client-container">
        <div className="pf-skeleton-wrap">
          <div
            className="pf-skeleton"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              margin: "0 auto 20px",
            }}
          />
          {[200, 160, 180, 140].map((w, i) => (
            <div
              key={i}
              className="pf-skeleton"
              style={{ height: 18, width: w, margin: "0 auto 12px" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || profile?.avatar;
  const avatarInitial = (profile?.fullName ||
    profile?.username ||
    "U")[0].toUpperCase();

  return (
    <div className="pf-page client-container">
      <Toast toast={toast} />

      {/* ── Page header ── */}
      <div className="pf-page-header">
        <h1 className="pf-page-title">Trang cá nhân</h1>
        <p className="pf-page-sub">Quản lý thông tin hồ sơ của bạn</p>
      </div>

      <div className="pf-layout">
        {/* ══════════════════════════════════════
            LEFT: Avatar card
        ══════════════════════════════════════ */}
        <div className="pf-sidebar">
          <div className="pf-avatar-card">
            {/* Avatar */}
            <div className="pf-avatar-wrap">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="avatar"
                  className="pf-avatar-img"
                />
              ) : (
                <div className="pf-avatar-fallback">{avatarInitial}</div>
              )}

              {editing && (
                <>
                  <button
                    className="pf-avatar-edit-btn"
                    onClick={() => avatarInputRef.current?.click()}
                    title="Đổi ảnh đại diện"
                  >
                    <FiCamera size={16} />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarPick}
                  />
                </>
              )}
            </div>

            <div className="pf-avatar-name">
              {profile?.fullName || profile?.username || "—"}
            </div>
            <div className="pf-avatar-username">@{profile?.username}</div>

            {/* Quick info */}
            <div className="pf-quick-info">
              {profile?.phone && (
                <div className="pf-quick-row">
                  <FiPhone size={13} />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="pf-quick-row">
                  <FiMapPin size={13} />
                  <span>{profile.address}</span>
                </div>
              )}
              {profile?.dob && (
                <div className="pf-quick-row">
                  <FiCalendar size={13} />
                  <span>{fmtDate(profile.dob)}</span>
                </div>
              )}
            </div>

            <div className="pf-member-since">
              Thành viên từ {fmtDate(profile?.createdAt)}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT: Tabs
        ══════════════════════════════════════ */}
        <div className="pf-main">
          {/* Tab bar */}
          <div className="pf-tabs">
            <button
              className={`pf-tab${activeTab === "info" ? " active" : ""}`}
              onClick={() => {
                setActiveTab("info");
                handleCancelEdit();
              }}
            >
              <FiUser size={15} /> Thông tin cá nhân
            </button>
            <button
              className={`pf-tab${activeTab === "password" ? " active" : ""}`}
              onClick={() => {
                setActiveTab("password");
                handleCancelEdit();
              }}
            >
              <FiShield size={15} /> Đổi mật khẩu
            </button>
          </div>

          {/* ── Tab: Thông tin cá nhân ── */}
          {activeTab === "info" && (
            <div className="pf-card">
              <div className="pf-card-header">
                <div>
                  <h2 className="pf-card-title">Thông tin cá nhân</h2>
                  <p className="pf-card-sub">
                    Cập nhật thông tin hồ sơ của bạn
                  </p>
                </div>
                {!editing ? (
                  <button className="pf-btn-edit" onClick={handleStartEdit}>
                    <FiEdit2 size={14} /> Chỉnh sửa
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="pf-btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      <FiX size={14} /> Hủy
                    </button>
                    <button
                      className="pf-btn-save"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="pf-spinner" /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <FiSave size={14} /> Lưu
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="pf-form-grid">
                {/* Email (readonly) */}
                <div className="pf-field pf-field-full">
                  <label className="pf-label">
                    <FiMail size={13} /> Email / Tên đăng nhập
                  </label>
                  <div className="pf-readonly-val">
                    {profile?.username}
                    <span className="pf-readonly-badge">Không thể đổi</span>
                  </div>
                </div>

                {/* Họ tên */}
                <div className="pf-field pf-field-full">
                  <label className="pf-label">
                    <FiUser size={13} /> Họ và tên
                  </label>
                  {editing ? (
                    <input
                      className="pf-input"
                      placeholder="Nhập họ và tên"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="pf-view-val">
                      {profile?.fullName || (
                        <span className="pf-empty-val">Chưa cập nhật</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ngày sinh */}
                <div className="pf-field">
                  <label className="pf-label">
                    <FiCalendar size={13} /> Ngày sinh
                  </label>
                  {editing ? (
                    <>
                      <input
                        className={`pf-input${formErrors.dob ? " error" : ""}`}
                        type="date"
                        value={form.dob}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, dob: e.target.value }));
                          if (formErrors.dob)
                            setFormErrors((p) => ({ ...p, dob: "" }));
                        }}
                      />
                      {formErrors.dob && (
                        <p className="pf-field-error">{formErrors.dob}</p>
                      )}
                    </>
                  ) : (
                    <div className="pf-view-val">
                      {profile?.dob ? (
                        fmtDate(profile.dob)
                      ) : (
                        <span className="pf-empty-val">Chưa cập nhật</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Giới tính */}
                <div className="pf-field">
                  <label className="pf-label">
                    <FiUser size={13} /> Giới tính
                  </label>
                  {editing ? (
                    <select
                      className="pf-input pf-select"
                      value={form.gender}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, gender: e.target.value }))
                      }
                    >
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="pf-view-val">
                      {genderLabel(profile?.gender)}
                    </div>
                  )}
                </div>

                {/* SĐT */}
                <div className="pf-field">
                  <label className="pf-label">
                    <FiPhone size={13} /> Số điện thoại
                  </label>
                  {editing ? (
                    <>
                      <input
                        className={`pf-input${formErrors.phone ? " error" : ""}`}
                        placeholder="0xxxxxxxxx"
                        value={form.phone}
                        onChange={(e) => {
                          setForm((p) => ({ ...p, phone: e.target.value }));
                          if (formErrors.phone)
                            setFormErrors((p) => ({ ...p, phone: "" }));
                        }}
                      />
                      {formErrors.phone && (
                        <p className="pf-field-error">{formErrors.phone}</p>
                      )}
                    </>
                  ) : (
                    <div className="pf-view-val">
                      {profile?.phone || (
                        <span className="pf-empty-val">Chưa cập nhật</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Địa chỉ */}
                <div className="pf-field pf-field-full">
                  <label className="pf-label">
                    <FiMapPin size={13} /> Địa chỉ
                  </label>
                  {editing ? (
                    <input
                      className="pf-input"
                      placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố"
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="pf-view-val">
                      {profile?.address || (
                        <span className="pf-empty-val">Chưa cập nhật</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Đổi mật khẩu ── */}
          {activeTab === "password" && (
            <div className="pf-card">
              <div className="pf-card-header">
                <div>
                  <h2 className="pf-card-title">Đổi mật khẩu</h2>
                  <p className="pf-card-sub">
                    Mật khẩu mới phải có ít nhất 8 ký tự
                  </p>
                </div>
              </div>

              <div className="pf-pw-form">
                {/* Mật khẩu hiện tại */}
                <div className="pf-field pf-field-full">
                  <label className="pf-label">
                    <FiLock size={13} /> Mật khẩu hiện tại
                  </label>
                  <div className="pf-pw-wrap">
                    <input
                      className={`pf-input${pwErrors.old ? " error" : ""}`}
                      type={showOld ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      value={pwForm.old}
                      onChange={(e) => {
                        setPwForm((p) => ({ ...p, old: e.target.value }));
                        if (pwErrors.old)
                          setPwErrors((p) => ({ ...p, old: "" }));
                      }}
                    />
                    <button
                      className="pf-pw-toggle"
                      onClick={() => setShowOld((s) => !s)}
                      type="button"
                    >
                      {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {pwErrors.old && (
                    <p className="pf-field-error">{pwErrors.old}</p>
                  )}
                </div>

                {/* Mật khẩu mới */}
                <div className="pf-field">
                  <label className="pf-label">
                    <FiLock size={13} /> Mật khẩu mới
                  </label>
                  <div className="pf-pw-wrap">
                    <input
                      className={`pf-input${pwErrors.newPw ? " error" : ""}`}
                      type={showNew ? "text" : "password"}
                      placeholder="Ít nhất 8 ký tự"
                      value={pwForm.newPw}
                      onChange={(e) => {
                        setPwForm((p) => ({ ...p, newPw: e.target.value }));
                        if (pwErrors.newPw)
                          setPwErrors((p) => ({ ...p, newPw: "" }));
                      }}
                    />
                    <button
                      className="pf-pw-toggle"
                      onClick={() => setShowNew((s) => !s)}
                      type="button"
                    >
                      {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {pwErrors.newPw && (
                    <p className="pf-field-error">{pwErrors.newPw}</p>
                  )}
                  {/* Strength bar */}
                  {pwForm.newPw && (
                    <div className="pf-pw-strength">
                      {["weak", "medium", "strong", "very-strong"].map(
                        (lvl, i) => {
                          const len = pwForm.newPw.length;
                          const active =
                            (len >= 8 && i === 0) ||
                            (len >= 10 && i <= 1) ||
                            (len >= 12 && i <= 2) ||
                            (len >= 14 && i <= 3);
                          return (
                            <div
                              key={lvl}
                              className={`pf-pw-bar${active ? ` ${lvl}` : ""}`}
                            />
                          );
                        },
                      )}
                      <span className="pf-pw-hint">
                        {pwForm.newPw.length < 8
                          ? "Quá ngắn"
                          : pwForm.newPw.length < 10
                            ? "Yếu"
                            : pwForm.newPw.length < 12
                              ? "Trung bình"
                              : pwForm.newPw.length < 14
                                ? "Mạnh"
                                : "Rất mạnh"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="pf-field">
                  <label className="pf-label">
                    <FiLock size={13} /> Xác nhận mật khẩu mới
                  </label>
                  <div className="pf-pw-wrap">
                    <input
                      className={`pf-input${pwErrors.confirm ? " error" : ""}`}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      value={pwForm.confirm}
                      onChange={(e) => {
                        setPwForm((p) => ({ ...p, confirm: e.target.value }));
                        if (pwErrors.confirm)
                          setPwErrors((p) => ({ ...p, confirm: "" }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleChangePw();
                      }}
                    />
                    <button
                      className="pf-pw-toggle"
                      onClick={() => setShowConfirm((s) => !s)}
                      type="button"
                    >
                      {showConfirm ? (
                        <FiEyeOff size={16} />
                      ) : (
                        <FiEye size={16} />
                      )}
                    </button>
                  </div>
                  {pwErrors.confirm && (
                    <p className="pf-field-error">{pwErrors.confirm}</p>
                  )}
                  {/* Match indicator */}
                  {pwForm.confirm && pwForm.newPw && (
                    <p
                      className={`pf-pw-match${pwForm.newPw === pwForm.confirm ? " ok" : " no"}`}
                    >
                      {pwForm.newPw === pwForm.confirm ? (
                        <>
                          <FiCheckCircle size={12} /> Mật khẩu khớp
                        </>
                      ) : (
                        <>
                          <FiAlertCircle size={12} /> Chưa khớp
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="pf-field pf-field-full">
                  <button
                    className="pf-btn-change-pw"
                    onClick={handleChangePw}
                    disabled={pwSaving}
                  >
                    {pwSaving ? (
                      <>
                        <div className="pf-spinner pf-spinner-white" /> Đang xử
                        lý...
                      </>
                    ) : (
                      <>
                        <FiShield size={15} /> Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
