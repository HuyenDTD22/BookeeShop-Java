import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiStar,
  FiPackage,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getBooks,
  deleteBook,
  getCategories,
} from "../../../services/admin/bookService";
import { formatCurrency, formatCompact } from "../../../utils/format";
import { AuthContext } from "../../../contexts/AuthContext";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";
const PAGE_SIZE = 10;

/* ══════════════════════════════════════════
   Flatten CategoryTreeResponse (có children) thành list phẳng
   mỗi item: { id, name, label (có indent), depth }
═══════════════════════════════════════════ */
const flattenCategoryTree = (nodes = [], depth = 0) => {
  const result = [];
  for (const node of nodes) {
    // prefix để thể hiện cấp bậc
    const prefix = depth === 0 ? "" : "　".repeat(depth) + "└ ";
    result.push({
      id: node.id,
      name: node.name,
      label: prefix + node.name,
      depth,
    });
    if (node.children?.length) {
      result.push(...flattenCategoryTree(node.children, depth + 1));
    }
  }
  return result;
};

/* ── Confirm Delete Modal ── */
const ConfirmModal = ({ book, onConfirm, onCancel, loading }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      background: "rgba(15,28,53,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      className="animate-fadeIn"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 28,
        maxWidth: 420,
        width: "100%",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: "var(--danger-bg)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--danger)",
            flexShrink: 0,
          }}
        >
          <FiTrash2 size={18} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            fontFamily: "'Merriweather', serif",
          }}
        >
          Xác nhận xóa sách
        </h3>
      </div>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        Bạn có chắc muốn xóa{" "}
        <strong style={{ color: "var(--text-primary)" }}>
          "{book?.title}"
        </strong>
        ? Hành động này không thể hoàn tác.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn-secondary-admin" onClick={onCancel}>
          Hủy
        </button>
        <button
          className="btn-danger-admin"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <div
              className="spinner"
              style={{ width: 14, height: 14, borderWidth: 2 }}
            />
          ) : (
            <FiTrash2 size={14} />
          )}
          Xóa sách
        </button>
      </div>
    </div>
  </div>
);

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 3000,
      background: type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
      color: type === "success" ? "var(--success)" : "var(--danger)",
      border: `1px solid ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
      borderRadius: "var(--radius-md)",
      padding: "12px 18px",
      fontSize: "0.875rem",
      fontWeight: 500,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 260,
      animation: "fadeIn 0.25s ease",
    }}
  >
    <span>
      {type === "success" ? "✓" : "✕"} {message}
    </span>
    <button
      onClick={onClose}
      style={{
        marginLeft: "auto",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      ×
    </button>
  </div>
);

/* ── Star Rating ── */
const StarRating = ({ value }) => {
  if (!value || Number(value) === 0) {
    return (
      <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>—</span>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        justifyContent: "center",
      }}
    >
      <FiStar
        size={13}
        style={{ fill: "#f59e0b", color: "#f59e0b", flexShrink: 0 }}
      />
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#b45309" }}>
        {Number(value).toFixed(1)}
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════
   BookListPage
═══════════════════════════════════════════ */
const BookListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]); // flat list với indent label
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  /* Filter state */
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortVal, setSortVal] = useState("createdAt__desc");
  const [feature, setFeature] = useState("");
  const [inStock, setInStock] = useState("");
  const [categoryId, setCategoryId] = useState("");

  /* UI state */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Load categories tree → flatten ── */
  useEffect(() => {
    getCategories()
      .then((res) => {
        // API trả về: { result: List<CategoryTreeResponse> }
        // CategoryTreeResponse có: id, name, children[]
        const tree = res?.result ?? [];
        setCategories(flattenCategoryTree(Array.isArray(tree) ? tree : []));
      })
      .catch(() => {});
  }, []);

  /* ── Fetch books ── */
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [sortBy, sortDir] = sortVal.split("__");
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(keyword && { keyword }),
        ...(categoryId && { categoryId }),
        ...(feature !== "" && { feature: feature === "true" }),
        ...(inStock !== "" && { inStock: inStock === "true" }),
      };
      const res = await getBooks(params);
      const data = res?.result;
      setBooks(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalItems(data?.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [page, sortVal, keyword, categoryId, feature, inStock]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteBook(deleteTarget.id);
      showToast(`Đã xóa sách "${deleteTarget.title}"`);
      setDeleteTarget(null);
      fetchBooks();
    } catch {
      showToast("Xóa sách thất bại. Vui lòng thử lại.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setKeyword("");
    setSortVal("createdAt__desc");
    setFeature("");
    setInStock("");
    setCategoryId("");
    setPage(0);
  };

  const stockBadge = (stock) => {
    if (stock === 0) return { label: "Hết hàng", cls: "stock-out" };
    if (stock <= 10) return { label: `${stock} còn`, cls: "stock-low" };
    return { label: stock, cls: "stock-ok" };
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmModal
          book={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý sách</h1>
          <p className="page-subtitle">{totalItems} cuốn sách trong hệ thống</p>
        </div>
        {hasPermission("BOOK_CREATE") && (
          <button
            className="btn-primary-admin"
            onClick={() => navigate(`/${ADMIN}/book/create`)}
          >
            <FiPlus size={15} /> Thêm sách mới
          </button>
        )}
      </div>

      {error && (
        <div
          className="alert-admin alert-danger-admin animate-fadeIn"
          style={{ marginBottom: 20 }}
        >
          <FiAlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="book-list-toolbar">
        {/* Search */}
        <form className="book-search-wrap" onSubmit={handleSearch}>
          <FiSearch size={15} className="search-icon" />
          <input
            className="book-search-input"
            placeholder="Tìm theo tên, tác giả..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        {/* Filters */}
        <div className="book-filter-group">
          {/* ── Category filter — phân cấp cha/con ── */}
          <select
            className="filter-select"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(0);
            }}
            style={{ minWidth: 190 }}
          >
            <option value="">Tất cả thể loại</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Feature */}
          <select
            className="filter-select"
            value={feature}
            onChange={(e) => {
              setFeature(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả loại</option>
            <option value="true">Nổi bật</option>
            <option value="false">Thường</option>
          </select>

          {/* Stock */}
          <select
            className="filter-select"
            value={inStock}
            onChange={(e) => {
              setInStock(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả kho</option>
            <option value="true">Còn hàng</option>
            <option value="false">Hết hàng</option>
          </select>

          {/* Sort */}
          <select
            className="filter-select"
            value={sortVal}
            onChange={(e) => {
              setSortVal(e.target.value);
              setPage(0);
            }}
          >
            <option value="createdAt__desc">Mới nhất</option>
            <option value="createdAt__asc">Cũ nhất</option>
            <option value="title__asc">Tên A→Z</option>
            <option value="title__desc">Tên Z→A</option>
            <option value="price__asc">Giá tăng dần</option>
            <option value="price__desc">Giá giảm dần</option>
            <option value="stock__asc">Tồn kho tăng</option>
            <option value="stock__desc">Tồn kho giảm</option>
          </select>

          <button
            className="btn-secondary-admin"
            onClick={resetFilters}
            title="Đặt lại bộ lọc"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="book-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {/*
                Đặt width trực tiếp trên <th> để browser tự tính toán
                — không dùng <colgroup> + table-layout: fixed để tránh lệch
              */}
              <th style={{ width: 48, textAlign: "center" }}>STT</th>
              <th style={{ width: 68 }}>Ảnh</th>
              <th>Sách</th>
              <th style={{ width: 155 }}>Giá</th>
              <th style={{ width: 100, textAlign: "center" }}>Tồn kho</th>
              <th style={{ width: 80, textAlign: "center" }}>Đã bán</th>
              <th style={{ width: 90, textAlign: "center" }}>Rating</th>
              <th style={{ width: 88, textAlign: "center" }}>Loại</th>
              <th style={{ width: 118, textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((__, j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ height: 16, borderRadius: 4 }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : books.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <FiPackage
                    size={36}
                    style={{
                      opacity: 0.25,
                      display: "block",
                      margin: "0 auto 12px",
                    }}
                  />
                  Không có sách nào phù hợp
                </td>
              </tr>
            ) : (
              books.map((book, index) => {
                const stock = stockBadge(book.stock ?? 0);
                return (
                  <tr
                    key={book.id}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 25}ms` }}
                  >
                    {/* STT */}
                    <td
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {page * PAGE_SIZE + index + 1}
                    </td>

                    {/* Ảnh */}
                    <td>
                      {book.thumbnail ? (
                        <img
                          src={book.thumbnail}
                          alt=""
                          className="book-thumbnail-cell"
                        />
                      ) : (
                        <div className="book-thumbnail-placeholder">
                          <FiPackage size={16} />
                        </div>
                      )}
                    </td>

                    {/* Sách — title + author, cùng căn lề trái với header */}
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          fontSize: "0.875rem",
                          lineHeight: 1.4,
                          marginBottom: 3,
                          maxWidth: 260,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          maxWidth: 260,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {book.author}
                      </div>
                    </td>

                    {/* Giá — cùng căn lề trái với header */}
                    <td>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--accent)",
                          fontSize: "0.875rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCurrency(book.finalPrice ?? book.price)}
                      </div>
                      {book.discountPercentage > 0 && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            textDecoration: "line-through",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatCurrency(book.price)}
                        </div>
                      )}
                    </td>

                    {/* Tồn kho */}
                    <td style={{ textAlign: "center" }}>
                      <span className={`stock-badge ${stock.cls}`}>
                        {stock.label}
                      </span>
                    </td>

                    {/* Đã bán */}
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {formatCompact(book.totalSold ?? 0)}
                    </td>

                    {/* Rating */}
                    <td style={{ textAlign: "center" }}>
                      <StarRating value={book.averageRating} />
                    </td>

                    {/* Loại */}
                    <td style={{ textAlign: "center" }}>
                      {book.feature ? (
                        <span className="badge-admin badge-info">Nổi bật</span>
                      ) : (
                        <span className="badge-admin badge-muted">Thường</span>
                      )}
                    </td>

                    {/* Hành động */}
                    <td style={{ textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        {hasPermission("BOOK_VIEW") && (
                          <Link to={`/${ADMIN}/book/detail/${book.id}`}>
                            <button
                              className="btn-icon"
                              data-tooltip="Xem chi tiết"
                            >
                              <FiEye size={14} />
                            </button>
                          </Link>
                        )}
                        {hasPermission("BOOK_UPDATE") && (
                          <Link to={`/${ADMIN}/book/edit/${book.id}`}>
                            <button
                              className="btn-icon"
                              data-tooltip="Chỉnh sửa"
                            >
                              <FiEdit2 size={14} />
                            </button>
                          </Link>
                        )}
                        {hasPermission("BOOK_DELETE") && (
                          <button
                            className="btn-icon"
                            data-tooltip="Xóa"
                            onClick={() => setDeleteTarget(book)}
                            style={{
                              borderColor: "rgba(239,68,68,0.3)",
                              color: "var(--danger)",
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="book-pagination">
            <span className="pagination-info">
              Hiển thị {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, totalItems)} / {totalItems} sách
            </span>
            <div className="pagination-admin">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <FiChevronLeft size={14} />
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const pageNum =
                  totalPages <= 7
                    ? i
                    : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pageNum === page ? "active" : ""}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookListPage;
