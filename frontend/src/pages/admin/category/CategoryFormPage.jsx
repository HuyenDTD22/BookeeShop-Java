import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiUpload,
  FiFolder,
  FiInfo,
  FiLayers,
} from "react-icons/fi";
import {
  createCategory,
  updateCategory,
  getCategoryById,
  getAllCategories,
} from "../../../services/admin/categoryService";
import "../../../styles/admin/category.css";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Quill config (giống bên sách) ── */
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
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
  "image",
  "color",
  "background",
];

/* ── Flatten tree với indent, loại trừ node đang edit ── */
const flattenTree = (nodes = [], depth = 0, excludeId = null) => {
  const result = [];
  for (const node of nodes) {
    if (node.id === excludeId) continue;
    const prefix = depth === 0 ? "" : "　".repeat(depth) + "└ ";
    result.push({
      id: node.id,
      name: node.name,
      label: prefix + node.name,
      depth,
    });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1, excludeId));
    }
  }
  return result;
};

/* ── Image Upload ── */
const ImageUpload = ({ preview, onChange, onRemove, error }) => {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onChange(file);
  };

  return (
    <div>
      {preview ? (
        <div className="image-preview-wrap">
          <img src={preview} alt="preview" className="image-preview-img" />
          <button
            className="image-remove-btn"
            type="button"
            onClick={onRemove}
            title="Xóa ảnh"
          >
            <FiX size={12} />
          </button>
        </div>
      ) : (
        <div
          className={`image-upload-area ${dragging ? "drag-over" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <FiUpload
            size={26}
            style={{
              color: error ? "var(--danger)" : "var(--text-muted)",
              marginBottom: 10,
            }}
          />
          <p
            style={{
              fontSize: "0.875rem",
              color: error ? "var(--danger)" : "var(--text-secondary)",
              margin: 0,
            }}
          >
            Kéo thả hoặc{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>
              click để chọn ảnh
            </span>
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              margin: "6px 0 0",
            }}
          >
            PNG, JPG, WEBP — tối đa 5MB
          </p>
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
      {error && (
        <p
          style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 6 }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

/* ── Field wrapper ── */
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

/* ── Quill Editor component (react-quilljs) ── */
const QuillEditor = ({ value, onChange, placeholder }) => {
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: QUILL_MODULES,
    formats: QUILL_FORMATS,
    placeholder: placeholder || "Nhập mô tả...",
  });

  const initializedRef = useRef(false);

  /* Set nội dung ban đầu một lần khi quill sẵn sàng */
  useEffect(() => {
    if (quill && value && !initializedRef.current) {
      quill.clipboard.dangerouslyPasteHTML(value);
      initializedRef.current = true;
    }
  }, [quill, value]);

  /* Lắng nghe thay đổi → trả HTML về form */
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

/* ══════════════════════════════════════════
   CategoryFormPage — Create & Edit
═══════════════════════════════════════════ */
const CategoryFormPage = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [originalParentId, setOriginalParentId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load parent options */
  useEffect(() => {
    getAllCategories()
      .then((res) => {
        const tree = res?.result ?? [];
        setParentOptions(flattenTree(tree, 0, isEdit ? id : null));
      })
      .catch(() => {});
  }, [isEdit, id]);

  /* Load data khi edit */
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetchLoading(true);
    getCategoryById(id)
      .then((res) => {
        const c = res.result;
        setForm({
          name: c.name ?? "",
          description: c.description ?? "",
          parentId: c.parentId ?? "",
        });
        setOriginalParentId(c.parentId ?? null);
        if (c.thumbnail) setPreview(c.thumbnail);
      })
      .catch(() => showToast("Không thể tải thông tin danh mục", "error"))
      .finally(() => setFetchLoading(false));
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập tên danh mục";
    if (!isEdit && !thumbnail) errs.thumbnail = "Vui lòng chọn ảnh đại diện";
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
        const wasParent = !!originalParentId;
        const nowNoParent = !form.parentId;
        const removeParent = wasParent && nowNoParent;

        const data = {
          name: form.name.trim(),
          description: form.description,
          ...(form.parentId && { parentId: form.parentId }),
          ...(removeParent && { removeParent: true }),
        };
        await updateCategory(id, { data, thumbnail });
        showToast("Cập nhật danh mục thành công!");
      } else {
        const data = {
          name: form.name.trim(),
          description: form.description,
          ...(form.parentId && { parentId: form.parentId }),
        };
        await createCategory({ data, thumbnail });
        showToast("Thêm danh mục mới thành công!");
      }
      setTimeout(() => navigate(`/${ADMIN}/category`), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      showToast(
        msg || (isEdit ? "Cập nhật thất bại" : "Thêm danh mục thất bại"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="category-form-layout">
        {[420, 300].map((h, i) => (
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
        <Link to={`/${ADMIN}/category`}>Quản lý danh mục</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? "Cập nhật thông tin danh mục"
              : "Điền thông tin để tạo danh mục mới"}
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/category`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="category-form-layout">
          {/* ── LEFT: Main info ── */}
          <div>
            <div className="form-section">
              <div className="form-section-header">
                <FiInfo size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thông tin danh mục</h3>
              </div>
              <div className="form-section-body">
                {/* Tên */}
                <Field label="Tên danh mục" required error={errors.name}>
                  <input
                    name="name"
                    className="form-control-admin"
                    placeholder="Ví dụ: Văn học, Khoa học, Thiếu nhi..."
                    value={form.name}
                    onChange={handleChange}
                    style={errors.name ? { borderColor: "var(--danger)" } : {}}
                  />
                </Field>

                {/* Mô tả — Quill Rich Text Editor */}
                <div className="form-group-admin">
                  <label className="form-label-admin">Mô tả</label>
                  <QuillEditor
                    value={form.description}
                    onChange={handleDescriptionChange}
                    placeholder="Nhập mô tả cho danh mục này..."
                  />
                </div>
              </div>
            </div>

            {/* Parent category */}
            <div className="form-section">
              <div className="form-section-header">
                <FiLayers size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Danh mục cha</h3>
              </div>
              <div className="form-section-body">
                <Field label="Thuộc danh mục">
                  <select
                    name="parentId"
                    className="form-control-admin"
                    value={form.parentId}
                    onChange={handleChange}
                  >
                    <option value="">-- Không có (danh mục gốc) --</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: -10,
                  }}
                >
                  Để trống nếu đây là danh mục gốc (cấp cao nhất).
                </p>

                {/* Nút chuyển về gốc khi edit có parent */}
                {isEdit && originalParentId && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 12,
                      cursor: "pointer",
                      padding: "10px 12px",
                      background: "var(--warning-bg)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!form.parentId}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, parentId: "" }))
                      }
                      style={{ accentColor: "var(--warning)" }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--warning)",
                        }}
                      >
                        Chuyển thành danh mục gốc
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Xóa liên kết với danh mục cha hiện tại
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Image + submit ── */}
          <div>
            {/* Thumbnail */}
            <div className="form-section">
              <div className="form-section-header">
                <FiUpload size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Ảnh đại diện</h3>
              </div>
              <div className="form-section-body">
                <ImageUpload
                  preview={preview}
                  error={errors.thumbnail}
                  onChange={(file) => {
                    setThumbnail(file);
                    setPreview(URL.createObjectURL(file));
                    if (errors.thumbnail)
                      setErrors((p) => ({ ...p, thumbnail: "" }));
                  }}
                  onRemove={() => {
                    setThumbnail(null);
                    setPreview("");
                  }}
                />
                {isEdit && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: 8,
                    }}
                  >
                    Để trống nếu không muốn thay đổi ảnh hiện tại.
                  </p>
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
                    <FiSave size={15} />{" "}
                    {isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary-admin"
                onClick={() => navigate(`/${ADMIN}/category`)}
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

export default CategoryFormPage;
