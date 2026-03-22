import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiChevronDown,
  FiChevronRight,
  FiAlertTriangle,
  FiRefreshCw,
  FiLayers,
} from "react-icons/fi";
import {
  getAllCategories,
  deleteCategory,
} from "../../../services/admin/categoryService";
import { AuthContext } from "../../../contexts/AuthContext";
import "../../../styles/admin/category.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Flatten tree giữ depth ── */
const flattenTree = (nodes = [], depth = 0) => {
  const result = [];
  for (const node of nodes) {
    result.push({
      ...node,
      depth,
      hasChildren: (node.children?.length ?? 0) > 0,
    });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
};

const countNodes = (nodes = []) => {
  let n = 0;
  for (const node of nodes) {
    n++;
    if (node.children?.length) n += countNodes(node.children);
  }
  return n;
};

/* ── Confirm Delete Modal ── */
const ConfirmModal = ({ category, onConfirm, onCancel, loading }) => (
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
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--danger)",
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
          Xác nhận xóa danh mục
        </h3>
      </div>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          marginBottom: 8,
          lineHeight: 1.6,
        }}
      >
        Bạn có chắc muốn xóa danh mục{" "}
        <strong style={{ color: "var(--text-primary)" }}>
          "{category?.name}"
        </strong>
        ?
      </p>
      <p
        style={{
          color: "var(--warning)",
          fontSize: "0.82rem",
          marginBottom: 20,
          background: "var(--warning-bg)",
          padding: "8px 12px",
          borderRadius: "var(--radius-sm)",
          lineHeight: 1.5,
        }}
      >
        ⚠ Không thể xóa nếu danh mục còn danh mục con hoặc sách.
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
          Xóa danh mục
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
      minWidth: 280,
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

/* ── Category Row ── */
const CategoryRow = ({
  node,
  isCollapsed,
  onToggle,
  onDelete,
  hasPermission,
}) => {
  const indent = node.depth * 28;
  return (
    <div className="category-row" style={{ paddingLeft: 16 + indent }}>
      {/* Toggle */}
      {node.hasChildren ? (
        <button className="cat-toggle-btn" onClick={() => onToggle(node.id)}>
          {isCollapsed ? (
            <FiChevronRight size={12} />
          ) : (
            <FiChevronDown size={12} />
          )}
        </button>
      ) : (
        <div style={{ width: 28, flexShrink: 0 }} />
      )}

      {/* Thumb */}
      {node.thumbnail ? (
        <img src={node.thumbnail} alt="" className="cat-thumb" />
      ) : (
        <div className="cat-thumb-placeholder">
          <FiFolder size={16} />
        </div>
      )}

      {/* Info */}
      <div className="cat-info">
        <div className="cat-name">{node.name}</div>
      </div>

      {/* Children count */}
      {node.hasChildren && (
        <span className="cat-children-badge">
          <FiLayers size={10} />
          {node.children?.length} danh mục con
        </span>
      )}

      {/* Level badge */}
      <span
        className="badge-admin badge-muted"
        style={{ marginRight: 12, flexShrink: 0 }}
      >
        {node.depth === 0 ? "Danh mục cha" : `Cấp ${node.depth + 1}`}
      </span>

      {/* Actions */}
      <div className="cat-actions">
        {hasPermission("CATEGORY_VIEW") && (
          <Link to={`/${ADMIN}/category/detail/${node.id}`}>
            <button className="btn-icon" data-tooltip="Xem chi tiết">
              <FiEye size={14} />
            </button>
          </Link>
        )}
        {hasPermission("CATEGORY_UPDATE") && (
          <Link to={`/${ADMIN}/category/edit/${node.id}`}>
            <button className="btn-icon" data-tooltip="Chỉnh sửa">
              <FiEdit2 size={14} />
            </button>
          </Link>
        )}
        {hasPermission("CATEGORY_DELETE") && (
          <button
            className="btn-icon"
            data-tooltip="Xóa"
            onClick={() => onDelete(node)}
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              color: "var(--danger)",
            }}
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   CategoryListPage
═══════════════════════════════════════════ */
const CategoryListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(new Set());
  const [keyword, setKeyword] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllCategories();
      const data = res?.result ?? [];
      setFlatList(flattenTree(data));
      setTotalCount(countNodes(data));
    } catch {
      setError("Không thể tải danh sách danh mục.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggle = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteCategory(deleteTarget.id);
      showToast(`Đã xóa danh mục "${deleteTarget.name}"`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Xóa thất bại. Danh mục còn danh mục con hoặc sách.";
      showToast(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* Filter */
  const filtered = keyword.trim()
    ? flatList.filter(
        (n) =>
          n.name.toLowerCase().includes(keyword.toLowerCase()) ||
          n.description?.toLowerCase().includes(keyword.toLowerCase()),
      )
    : flatList;

  /* Ẩn con của node đang collapsed */
  const visible = keyword.trim()
    ? filtered
    : filtered.filter((node) => {
        if (node.depth === 0) return true;
        const idx = flatList.indexOf(node);
        for (let i = idx - 1; i >= 0; i--) {
          if (flatList[i].depth < node.depth) {
            if (collapsed.has(flatList[i].id)) return false;
            if (flatList[i].depth === 0) break;
          }
        }
        return true;
      });

  const allParentIds = new Set(
    flatList.filter((n) => n.hasChildren).map((n) => n.id),
  );

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmModal
          category={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý danh mục</h1>
          <p className="page-subtitle">{totalCount} danh mục trong hệ thống</p>
        </div>
        {hasPermission("CATEGORY_CREATE") && (
          <button
            className="btn-primary-admin"
            onClick={() => navigate(`/${ADMIN}/category/create`)}
          >
            <FiPlus size={15} /> Thêm danh mục
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

      {/* Toolbar */}
      <div className="cat-toolbar">
        <div className="cat-search-wrap">
          <FiSearch size={14} className="cat-search-icon" />
          <input
            className="cat-search-input"
            placeholder="Tìm theo tên danh mục..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-secondary-admin"
            style={{ fontSize: "0.82rem" }}
            onClick={() => setCollapsed(new Set())}
          >
            <FiChevronDown size={14} /> Mở rộng tất cả
          </button>
          <button
            className="btn-secondary-admin"
            style={{ fontSize: "0.82rem" }}
            onClick={() => setCollapsed(new Set(allParentIds))}
          >
            <FiChevronRight size={14} /> Thu gọn tất cả
          </button>
          <button
            className="btn-secondary-admin"
            onClick={fetchCategories}
            title="Làm mới"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="category-tree-wrap">
        {/* Table header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            background: "var(--bg-raised)",
            borderBottom: "2px solid var(--border)",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontWeight: 600,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ width: 28, flexShrink: 0 }} />
          <div style={{ width: 40, flexShrink: 0, marginRight: 12 }}>Ảnh</div>
          <div style={{ flex: 1 }}>Tên danh mục</div>
          <div
            style={{
              width: 160,
              flexShrink: 0,
              textAlign: "right",
              paddingRight: 12,
            }}
          >
            Loại
          </div>
          <div
            style={{
              width: 90,
              flexShrink: 0,
              textAlign: "right",
              paddingRight: 12,
            }}
          >
            Cấp bậc
          </div>
          <div style={{ width: 110, flexShrink: 0, textAlign: "center" }}>
            Hành động
          </div>
        </div>

        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="skeleton"
                style={{ height: 40, borderRadius: "var(--radius-sm)" }}
              />
            </div>
          ))
        ) : visible.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "var(--text-muted)",
            }}
          >
            <FiFolder
              size={36}
              style={{ opacity: 0.25, display: "block", margin: "0 auto 12px" }}
            />
            {keyword
              ? "Không tìm thấy danh mục phù hợp"
              : "Chưa có danh mục nào"}
          </div>
        ) : (
          visible.map((node) => (
            <CategoryRow
              key={node.id}
              node={node}
              isCollapsed={collapsed.has(node.id)}
              onToggle={handleToggle}
              onDelete={setDeleteTarget}
              hasPermission={hasPermission}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryListPage;
