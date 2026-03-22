import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBook,
  FiGrid,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";
import {
  getAllBooks,
  getFeaturedBooks,
  getNewestBooks,
  getBooksByCategory,
  getCategories,
} from "../../../services/client/clientBookService";
import BookCard from "../../../components/client/book/BookCard";
import FilterBar from "../../../components/client/book/FilterBar";
import ClientPagination from "../../../components/client/book/ClientPagination";
import "../../../styles/client/book-list.css";

/* ─────────────────────────────────────────────────────────────────
   BookListPage — dùng chung cho 3 loại:
   mode = "featured"  → GET /books/featured
   mode = "newest"    → GET /books/newest
   mode = "category"  → GET /books/category/:categoryId  (đọc từ useParams)
───────────────────────────────────────────────────────────────── */
const BookListPage = ({ mode = "all" }) => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryInfo, setCategoryInfo] = useState(null); // chỉ dùng khi mode = "category"

  const [params, setParams] = useState({
    page: 0,
    size: 20,
    sortBy: mode === "newest" ? "createdAt" : "createdAt",
    sortDir: "desc",
  });

  /* ── Load category info ── */
  useEffect(() => {
    if (mode !== "category" || !categoryId) return;
    getCategories()
      .then((res) => {
        const allCats = flattenCategories(res?.result ?? []);
        const found = allCats.find((c) => c.id === categoryId);
        if (found) setCategoryInfo(found);
      })
      .catch(() => {});
  }, [mode, categoryId]);

  /* ── Flatten category tree ── */
  const flattenCategories = (cats, result = []) => {
    cats.forEach((c) => {
      result.push(c);
      if (c.children?.length) flattenCategories(c.children, result);
    });
    return result;
  };

  /* ── Fetch books ── */
  const fetchBooks = useCallback(
    async (p) => {
      try {
        setLoading(true);
        setError("");
        let res;
        if (mode === "featured") {
          res = await getFeaturedBooks(p);
        } else if (mode === "newest") {
          res = await getNewestBooks(p);
        } else if (mode === "category") {
          res = await getBooksByCategory(categoryId, p);
        } else {
          res = await getAllBooks(p);
        }
        const page = res?.result;
        setBooks(page?.content ?? []);
        setMeta({
          totalPages: page?.totalPages ?? 0,
          totalElements: page?.totalElements ?? 0,
        });
      } catch {
        setError("Không thể tải danh sách sách.");
      } finally {
        setLoading(false);
      }
    },
    [mode, categoryId],
  );

  useEffect(() => {
    fetchBooks(params);
  }, [params, fetchBooks]);

  /* ── Page config ── */
  const config = {
    featured: {
      title: "Sách nổi bật",
      sub: "Những cuốn sách được yêu thích và đề xuất nhiều nhất",
      icon: FiTrendingUp,
      breadcrumb: [{ to: "/", label: "Trang chủ" }, { label: "Sách nổi bật" }],
    },
    newest: {
      title: "Sách mới nhất",
      sub: "Những đầu sách mới cập nhật gần đây",
      icon: FiStar,
      breadcrumb: [{ to: "/", label: "Trang chủ" }, { label: "Sách mới nhất" }],
    },
    category: {
      title: categoryInfo?.name ?? "Danh mục",
      sub: `Tất cả sách thuộc danh mục "${categoryInfo?.name ?? "..."}"`,
      icon: FiGrid,
      breadcrumb: [
        { to: "/", label: "Trang chủ" },
        { to: "/books", label: "Tất cả sách" },
        { label: categoryInfo?.name ?? "Danh mục" },
      ],
    },
    all: {
      title: "Tất cả sách",
      sub: "Khám phá toàn bộ kho sách của BookeeShop",
      icon: FiBook,
      breadcrumb: [{ to: "/", label: "Trang chủ" }, { label: "Tất cả sách" }],
    },
  };

  const { title, sub, icon: PageIcon, breadcrumb } = config[mode] ?? config.all;

  return (
    <div className="bl-page client-container">
      {/* Breadcrumb */}
      <nav className="bl-breadcrumb">
        {breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span>›</span>}
            {b.to ? (
              <Link to={b.to}>{b.label}</Link>
            ) : (
              <span className="bl-breadcrumb-current">{b.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Page header */}
      <div className="bl-page-header">
        {mode === "category" && categoryInfo?.thumbnail && (
          <img
            src={categoryInfo.thumbnail}
            alt={categoryInfo.name}
            className="bl-cat-thumb"
          />
        )}
        <div>
          <h1 className="bl-page-title">
            <PageIcon
              size={22}
              style={{ color: "var(--c-accent)", flexShrink: 0 }}
            />
            {title}
          </h1>
          <p className="bl-page-sub">
            {sub}
            {meta.totalElements > 0 && !loading && (
              <span className="bl-total-badge">
                {meta.totalElements.toLocaleString()} cuốn
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filter */}
      <FilterBar params={params} onChange={setParams} />

      {/* Content */}
      {error ? (
        <div className="bl-error">
          <p>{error}</p>
          <button className="bl-retry-btn" onClick={() => fetchBooks(params)}>
            Thử lại
          </button>
        </div>
      ) : loading ? (
        <div className="bl-grid">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="bl-skeleton-card" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bl-empty">
          <span className="bl-empty-icon">📭</span>
          <p>Không có sách nào phù hợp với bộ lọc.</p>
          <button
            className="bl-retry-btn"
            onClick={() =>
              setParams((p) => ({
                ...p,
                page: 0,
                sortBy: "createdAt",
                sortDir: "desc",
                minRating: undefined,
              }))
            }
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="bl-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <ClientPagination
            page={params.page}
            totalPages={meta.totalPages}
            onChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
          />
        </>
      )}
    </div>
  );
};

export default BookListPage;
