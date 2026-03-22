import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import {
  FiArrowLeft,
  FiSave,
  FiUpload,
  FiX,
  FiBook,
  FiDollarSign,
  FiInfo,
  FiTag,
} from "react-icons/fi";
import {
  createBook,
  updateBook,
  getBookById,
  getCategories,
} from "../../../services/admin/bookService";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Quill config ── */
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
            onClick={onRemove}
            type="button"
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
            size={28}
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

/* ── Form Field ── */
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
      <p style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: 4 }}>
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

/* ── Flatten category tree ── */
const flattenCategories = (categories = [], depth = 0) => {
  const result = [];
  for (const cat of categories) {
    result.push({ ...cat, depth });
    if (cat.children?.length)
      result.push(...flattenCategories(cat.children, depth + 1));
  }
  return result;
};

/* ── Quill Editor component (dùng react-quilljs hook) ── */
const QuillEditor = ({ value, onChange, placeholder }) => {
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: QUILL_MODULES,
    formats: QUILL_FORMATS,
    placeholder: placeholder || "Nhập mô tả sách...",
  });

  /* Set nội dung ban đầu khi quill sẵn sàng và value được truyền vào lần đầu */
  const initializedRef = useRef(false);
  useEffect(() => {
    if (quill && value && !initializedRef.current) {
      quill.clipboard.dangerouslyPasteHTML(value);
      initializedRef.current = true;
    }
  }, [quill, value]);

  /* Lắng nghe text-change để trả về HTML */
  useEffect(() => {
    if (!quill) return;
    const handler = () => {
      const html = quill.root.innerHTML;
      // Tránh trả về "<p><br></p>" khi editor rỗng
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
   BookFormPage — Create & Edit
═══════════════════════════════════════════ */
const BookFormPage = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    discountPercentage: 0,
    stock: "",
    author: "",
    supplier: "",
    publisher: "",
    publishYear: new Date().getFullYear(),
    language: "Tiếng Việt",
    size: "",
    weight: "",
    pageCount: "",
    feature: false,
    categoryId: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load categories */
  useEffect(() => {
    getCategories()
      .then((res) => {
        const raw = res?.result?.content ?? res?.result ?? [];
        setCategories(flattenCategories(Array.isArray(raw) ? raw : []));
      })
      .catch(() => {});
  }, []);

  /* Load book for edit mode */
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetchLoading(true);
    getBookById(id)
      .then((res) => {
        const b = res.result;
        setForm({
          title: b.title ?? "",
          description: b.description ?? "",
          price: b.price ?? "",
          discountPercentage: b.discountPercentage ?? 0,
          stock: b.stock ?? "",
          author: b.author ?? "",
          supplier: b.supplier ?? "",
          publisher: b.publisher ?? "",
          publishYear: b.publishYear ?? new Date().getFullYear(),
          language: b.language ?? "Tiếng Việt",
          size: b.size ?? "",
          weight: b.weight ?? "",
          pageCount: b.pageCount ?? "",
          feature: b.feature ?? false,
          categoryId: b.categoryId ?? "",
        });
        if (b.thumbnail) setPreview(b.thumbnail);
      })
      .catch(() => showToast("Không thể tải thông tin sách", "error"))
      .finally(() => setFetchLoading(false));
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Vui lòng nhập tên sách";
    if (!form.price) errs.price = "Vui lòng nhập giá";
    if (Number(form.price) < 0) errs.price = "Giá không được âm";
    if (form.stock === "") errs.stock = "Vui lòng nhập số lượng";
    if (!form.author.trim()) errs.author = "Vui lòng nhập tác giả";
    if (!form.categoryId) errs.categoryId = "Vui lòng chọn danh mục";
    if (!isEdit && !thumbnail) errs.thumbnail = "Vui lòng chọn ảnh bìa";
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
        title: form.title.trim(),
        description: form.description,
        price: Number(form.price),
        discountPercentage: Number(form.discountPercentage) || 0,
        stock: Number(form.stock),
        author: form.author.trim(),
        supplier: form.supplier.trim(),
        publisher: form.publisher.trim(),
        publishYear: Number(form.publishYear),
        language: form.language,
        size: form.size.trim(),
        weight: Number(form.weight) || 0,
        pageCount: Number(form.pageCount) || 0,
        feature: form.feature,
        categoryId: form.categoryId,
      };

      if (isEdit) {
        await updateBook(id, { data, thumbnail });
        showToast("Cập nhật sách thành công!");
      } else {
        await createBook({ data, thumbnail });
        showToast("Thêm sách mới thành công!");
      }
      setTimeout(() => navigate(`/${ADMIN}/book`), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      showToast(
        msg || (isEdit ? "Cập nhật thất bại" : "Thêm sách thất bại"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  /* Computed final price */
  const computedFinalPrice = () => {
    const price = Number(form.price);
    const discount = Number(form.discountPercentage);
    if (!price || price <= 0 || !discount || discount <= 0) return null;
    return price * (1 - discount / 100);
  };

  /* Loading skeleton */
  if (fetchLoading) {
    return (
      <div>
        <div
          style={{
            height: 48,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div className="skeleton" style={{ height: "100%" }} />
        </div>
        <div className="book-form-layout">
          {[500, 400].map((h, i) => (
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
        <Link to={`/${ADMIN}/book`}>Quản lý sách</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {isEdit ? "Chỉnh sửa sách" : "Thêm sách mới"}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Chỉnh sửa sách" : "Thêm sách mới"}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? "Cập nhật thông tin cuốn sách"
              : "Điền đầy đủ thông tin để thêm sách mới"}
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/book`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="book-form-layout">
          {/* ── LEFT column ── */}
          <div>
            {/* Basic info */}
            <div className="form-section">
              <div className="form-section-header">
                <FiBook size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thông tin cơ bản</h3>
              </div>
              <div className="form-section-body">
                <Field label="Tên sách" required error={errors.title}>
                  <input
                    name="title"
                    className="form-control-admin"
                    placeholder="Nhập tên sách..."
                    value={form.title}
                    onChange={handleChange}
                    style={errors.title ? { borderColor: "var(--danger)" } : {}}
                  />
                </Field>

                <Field label="Danh mục" required error={errors.categoryId}>
                  <select
                    name="categoryId"
                    className="form-control-admin"
                    value={form.categoryId}
                    onChange={handleChange}
                    style={
                      errors.categoryId ? { borderColor: "var(--danger)" } : {}
                    }
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {"　".repeat(cat.depth)}
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Rich Text Editor — react-quilljs */}
                <div className="form-group-admin">
                  <label className="form-label-admin">Mô tả sách</label>
                  <QuillEditor
                    value={form.description}
                    onChange={handleDescriptionChange}
                    placeholder="Nhập mô tả sách..."
                  />
                </div>
              </div>
            </div>

            {/* Detail info */}
            <div className="form-section">
              <div className="form-section-header">
                <FiInfo size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thông tin chi tiết</h3>
              </div>
              <div className="form-section-body">
                <div className="form-row-2">
                  <Field label="Tác giả" required error={errors.author}>
                    <input
                      name="author"
                      className="form-control-admin"
                      placeholder="Robert C. Martin"
                      value={form.author}
                      onChange={handleChange}
                      style={
                        errors.author ? { borderColor: "var(--danger)" } : {}
                      }
                    />
                  </Field>
                  <Field label="Nhà cung cấp">
                    <input
                      name="supplier"
                      className="form-control-admin"
                      placeholder="NXB..."
                      value={form.supplier}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
                <div className="form-row-2">
                  <Field label="Nhà xuất bản">
                    <input
                      name="publisher"
                      className="form-control-admin"
                      placeholder="NXB Trẻ"
                      value={form.publisher}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Năm xuất bản">
                    <input
                      name="publishYear"
                      type="number"
                      className="form-control-admin"
                      placeholder="2024"
                      value={form.publishYear}
                      onChange={handleChange}
                      min="1900"
                      max="2099"
                    />
                  </Field>
                </div>
                <div className="form-row-3">
                  <Field label="Ngôn ngữ">
                    <input
                      name="language"
                      className="form-control-admin"
                      value={form.language}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Kích thước">
                    <input
                      name="size"
                      className="form-control-admin"
                      placeholder="14×20 cm"
                      value={form.size}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Số trang">
                    <input
                      name="pageCount"
                      type="number"
                      className="form-control-admin"
                      placeholder="300"
                      value={form.pageCount}
                      onChange={handleChange}
                      min="1"
                    />
                  </Field>
                </div>
                <Field label="Trọng lượng (gram)">
                  <input
                    name="weight"
                    type="number"
                    className="form-control-admin"
                    placeholder="350"
                    value={form.weight}
                    onChange={handleChange}
                    min="0"
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* ── RIGHT column ── */}
          <div>
            {/* Thumbnail */}
            <div className="form-section">
              <div className="form-section-header">
                <FiUpload size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Ảnh bìa sách</h3>
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
              </div>
            </div>

            {/* Pricing */}
            <div className="form-section">
              <div className="form-section-header">
                <FiDollarSign size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Giá & Kho hàng</h3>
              </div>
              <div className="form-section-body">
                <Field label="Giá gốc (VNĐ)" required error={errors.price}>
                  <input
                    name="price"
                    type="number"
                    className="form-control-admin"
                    placeholder="120000"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    style={errors.price ? { borderColor: "var(--danger)" } : {}}
                  />
                </Field>

                <Field
                  label="% Giảm giá"
                  hint={
                    computedFinalPrice()
                      ? `→ Giá sau giảm: ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(computedFinalPrice())}`
                      : undefined
                  }
                >
                  <input
                    name="discountPercentage"
                    type="number"
                    className="form-control-admin"
                    placeholder="0"
                    value={form.discountPercentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </Field>

                <Field label="Số lượng kho" required error={errors.stock}>
                  <input
                    name="stock"
                    type="number"
                    className="form-control-admin"
                    placeholder="100"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                    style={errors.stock ? { borderColor: "var(--danger)" } : {}}
                  />
                </Field>
              </div>
            </div>

            {/* Settings */}
            <div className="form-section">
              <div className="form-section-header">
                <FiTag size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Cài đặt</h3>
              </div>
              <div className="form-section-body">
                <label className="feature-toggle">
                  <input
                    type="checkbox"
                    name="feature"
                    checked={form.feature}
                    onChange={handleChange}
                  />
                  <div>
                    <div className="feature-toggle-label">⭐ Sách nổi bật</div>
                    <div className="feature-toggle-desc">
                      Hiển thị trong mục sách nổi bật trang chủ
                    </div>
                  </div>
                </label>
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
                    <FiSave size={15} /> {isEdit ? "Lưu thay đổi" : "Thêm sách"}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary-admin"
                onClick={() => navigate(`/${ADMIN}/book`)}
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

export default BookFormPage;
