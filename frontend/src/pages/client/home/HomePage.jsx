import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiTrendingUp,
  FiBook,
  FiGrid,
} from "react-icons/fi";
import {
  getAllBooks,
  getFeaturedBooks,
  getNewestBooks,
  getCategories,
} from "../../../services/client/clientBookService";
import BookCard from "../../../components/client/book/BookCard";
import CategoryCard from "../../../components/client/category/CategoryCard";
import FilterBar from "../../../components/client/book/FilterBar";
import ClientPagination from "../../../components/client/book/ClientPagination";
import "../../../styles/client/client-layout.css";

/* ── Horizontal scroll section ── */
const HorizSection = ({
  title,
  icon: Icon,
  items,
  linkTo,
  renderItem,
  loading,
}) => {
  const [idx, setIdx] = useState(0);
  const perPage = 5;
  const total = items.length;
  const pages = Math.ceil(total / perPage);
  const visible = items.slice(idx * perPage, idx * perPage + perPage);

  return (
    <div className="cl-section">
      <div className="cl-section-header">
        <h2 className="cl-section-title">
          <Icon size={18} style={{ color: "var(--c-accent)" }} />
          {title}
        </h2>
        <Link to={linkTo} className="cl-see-more">
          Xem thêm <FiArrowRight size={14} />
        </Link>
      </div>

      <div style={{ position: "relative" }}>
        {/* Prev */}
        {idx > 0 && (
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            style={{
              position: "absolute",
              left: -18,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid var(--c-border)",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--c-text-2)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <FiChevronLeft size={16} />
          </button>
        )}

        <div className="cl-book-grid">
          {loading
            ? [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "2/3.2",
                    background: "var(--c-raised)",
                    borderRadius: "var(--radius-md)",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))
            : visible.map((item) => renderItem(item))}
        </div>

        {/* Next */}
        {idx < pages - 1 && (
          <button
            onClick={() => setIdx((i) => Math.min(pages - 1, i + 1))}
            style={{
              position: "absolute",
              right: -18,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#fff",
              border: "1px solid var(--c-border)",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--c-text-2)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <FiChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   HomePage
═══════════════════════════════════════════ */
const HomePage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);

  /* All books with pagination & filter */
  const [allBooks, setAllBooks] = useState([]);
  const [allMeta, setAllMeta] = useState({ totalPages: 0, totalElements: 0 });
  const [allParams, setAllParams] = useState({
    page: 0,
    size: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);

  /* Initial load */
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingInit(true);
        const [catRes, featRes, newRes] = await Promise.all([
          getCategories(),
          getFeaturedBooks({ page: 0, size: 20 }),
          getNewestBooks({ page: 0, size: 20 }),
        ]);
        setCategories(catRes?.result ?? []);
        setFeatured(featRes?.result?.content ?? []);
        setNewest(newRes?.result?.content ?? []);
      } catch {
        /* silent */
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  /* All books re-fetch on param change */
  const fetchAll = useCallback(async (params) => {
    try {
      setLoadingAll(true);
      const res = await getAllBooks(params);
      setAllBooks(res?.result?.content ?? []);
      setAllMeta({
        totalPages: res?.result?.totalPages ?? 0,
        totalElements: res?.result?.totalElements ?? 0,
      });
    } catch {
      /* silent */
    } finally {
      setLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(allParams);
  }, [allParams, fetchAll]);

  /* Flatten category tree for the grid (show all root categories) */
  const flatCats = categories; // chỉ hiển thị root category trong grid

  return (
    <div
      className="client-container"
      style={{ paddingTop: 32, paddingBottom: 48 }}
    >
      {/* ── Hero Banner ── */}
      <div
        style={{
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0f1c35 0%, #1a3a6b 60%, #1a6dc4 100%)",
          padding: "48px 56px",
          marginBottom: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: "50%",
            transform: "translateY(-50%)",
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: "40px solid rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 160,
            top: "20%",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "25px solid rgba(255,255,255,0.04)",
          }}
        />

        <div style={{ maxWidth: 560, position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              color: "#7dc4ff",
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: "0.78rem",
              fontWeight: 600,
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            ⚡ Khuyến mãi tháng này
          </div>
          <h1
            style={{
              fontFamily: "'Merriweather', serif",
              fontSize: "2rem",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.3,
              marginBottom: 16,
            }}
          >
            Khám phá thế giới tri thức với hàng nghìn đầu sách
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1rem",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Đa dạng thể loại — Giao hàng nhanh — Giá tốt nhất thị trường
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link
              to="/books"
              style={{
                background: "#fff",
                color: "#1a6dc4",
                padding: "11px 24px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.2s",
              }}
            >
              <FiBook size={15} /> Mua ngay
            </Link>
            <Link
              to="/books/featured"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                padding: "11px 24px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Sách nổi bật
            </Link>
          </div>
        </div>

        <div style={{ fontSize: "7rem", position: "relative", lineHeight: 1 }}>
          📚
        </div>
      </div>

      {/* ── Categories ── */}
      {flatCats.length > 0 && (
        <div className="cl-section">
          <div className="cl-section-header">
            <h2 className="cl-section-title">
              <FiGrid size={18} style={{ color: "var(--c-accent)" }} />
              Danh mục sách
            </h2>
          </div>
          <div className="cl-cat-grid">
            {flatCats.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}

      {/* ── Featured ── */}
      <HorizSection
        title="Sách nổi bật"
        icon={FiTrendingUp}
        items={featured}
        linkTo="/books/featured"
        loading={loadingInit}
        renderItem={(book) => <BookCard key={book.id} book={book} />}
      />

      {/* ── Newest ── */}
      <HorizSection
        title="Sách mới nhất"
        icon={FiStar}
        items={newest}
        linkTo="/books/newest"
        loading={loadingInit}
        renderItem={(book) => <BookCard key={book.id} book={book} />}
      />

      {/* ── All books ── */}
      <div className="cl-section">
        <div className="cl-section-header">
          <h2 className="cl-section-title">
            <FiBook size={18} style={{ color: "var(--c-accent)" }} />
            Tất cả sách
            {allMeta.totalElements > 0 && (
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 400,
                  color: "var(--c-text-muted)",
                  fontFamily: "inherit",
                }}
              >
                ({allMeta.totalElements.toLocaleString()} cuốn)
              </span>
            )}
          </h2>
        </div>

        <FilterBar params={allParams} onChange={setAllParams} />

        {loadingAll ? (
          <div className="cl-spinner" />
        ) : allBooks.length === 0 ? (
          <div className="cl-empty">
            <div className="cl-empty-icon">📭</div>
            <p>Không có sách nào phù hợp.</p>
          </div>
        ) : (
          <>
            <div className="cl-book-grid">
              {allBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            <ClientPagination
              page={allParams.page}
              totalPages={allMeta.totalPages}
              onChange={(p) => setAllParams((prev) => ({ ...prev, page: p }))}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
