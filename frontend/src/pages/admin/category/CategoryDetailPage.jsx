import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiFolder,
  FiInfo,
  FiAlertTriangle,
  FiLayers,
  FiTag,
} from "react-icons/fi";
import {
  getCategoryById,
  getAllCategories,
} from "../../../services/admin/categoryService";
import { formatDate } from "../../../utils/format";
import "../../../styles/admin/category.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Tìm children của một node trong tree ── */
const findNodeInTree = (nodes = [], id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, treeRes] = await Promise.all([
        getCategoryById(id),
        getAllCategories(),
      ]);
      setCategory(catRes.result);

      // Lấy children từ tree response
      const tree = treeRes?.result ?? [];
      const node = findNodeInTree(tree, id);
      setChildren(node?.children ?? []);
    } catch {
      setError("Không thể tải thông tin danh mục.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}
      >
        {[280, 400].map((h, i) => (
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

  if (error || !category) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy danh mục"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/category`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/category`}>Quản lý danh mục</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>{category.name}</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.3rem" }}>
            {category.name}
          </h1>
          <p className="page-subtitle">
            {category.parentName
              ? `Danh mục con của: ${category.parentName}`
              : "Danh mục gốc"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/category`)}
          >
            <FiArrowLeft size={14} /> Quay lại
          </button>
          <Link to={`/${ADMIN}/category/edit/${category.id}`}>
            <button className="btn-primary-admin">
              <FiEdit2 size={14} /> Chỉnh sửa
            </button>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Left — thumbnail */}
        <div>
          <div className="detail-section">
            <div className="detail-section-header">
              <FiFolder size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Hình ảnh</h3>
            </div>
            <div
              className="detail-section-body"
              style={{ textAlign: "center" }}
            >
              {category.thumbnail ? (
                <img
                  src={category.thumbnail}
                  alt={category.name}
                  className="cat-detail-cover"
                />
              ) : (
                <div className="cat-detail-cover-placeholder">
                  <FiFolder size={40} style={{ opacity: 0.25 }} />
                  <span>Chưa có ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="detail-section" style={{ marginTop: 20 }}>
            <div className="detail-section-header">
              <FiTag size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin nhanh</h3>
            </div>
            <div className="detail-section-body">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div className="info-item">
                  <label>Loại</label>
                  <div className="info-value">
                    {category.parentId ? (
                      <span className="badge-admin badge-info">
                        Danh mục con
                      </span>
                    ) : (
                      <span className="badge-admin badge-success">
                        Danh mục cha
                      </span>
                    )}
                  </div>
                </div>
                {category.parentName && (
                  <div className="info-item">
                    <label>Danh mục cha</label>
                    <div>
                      <Link
                        to={`/${ADMIN}/category/detail/${category.parentId}`}
                      >
                        <span className="parent-badge">
                          <FiFolder size={12} />
                          {category.parentName}
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
                <div className="info-item">
                  <label>Số danh mục con</label>
                  <div
                    className="info-value"
                    style={{ fontWeight: 700, fontSize: "1.1rem" }}
                  >
                    {children.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — detail */}
        <div>
          {/* Basic info */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiInfo size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin danh mục</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Tên danh mục</label>
                  <div
                    className="info-value"
                    style={{ fontSize: "1rem", fontWeight: 600 }}
                  >
                    {category.name}
                  </div>
                </div>
                <div className="info-item">
                  <label>Danh mục cha</label>
                  <div className="info-value">
                    {category.parentName ? (
                      <Link
                        to={`/${ADMIN}/category/detail/${category.parentId}`}
                      >
                        <span className="parent-badge">
                          <FiFolder size={11} /> {category.parentName}
                        </span>
                      </Link>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>
                        Không có (gốc)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-item" style={{ marginTop: 16 }}>
                <label>Mô tả</label>
                <div
                  className="info-value"
                  style={{
                    lineHeight: 1.7,
                    marginTop: 6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {category.description || (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Chưa có mô tả
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Children categories */}
          {children.length > 0 && (
            <div className="detail-section">
              <div className="detail-section-header">
                <FiLayers size={15} style={{ color: "var(--accent)" }} />
                <h3 className="detail-section-title">
                  Danh mục con ({children.length})
                </h3>
              </div>
              <div className="detail-section-body">
                <div className="child-cat-grid">
                  {children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/${ADMIN}/category/detail/${child.id}`}
                      className="child-cat-card"
                    >
                      {child.thumbnail ? (
                        <img
                          src={child.thumbnail}
                          alt=""
                          className="child-cat-thumb"
                        />
                      ) : (
                        <div className="child-cat-thumb-placeholder">
                          <FiFolder size={14} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="child-cat-name">{child.name}</div>
                        {child.children?.length > 0 && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {child.children.length} danh mục con
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
