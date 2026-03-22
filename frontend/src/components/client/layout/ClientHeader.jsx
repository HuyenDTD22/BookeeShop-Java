import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiSearch,
  FiShoppingCart,
  FiBell,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiList,
  FiPackage,
  FiHome,
} from "react-icons/fi";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import {
  getCategories,
  searchBooks,
} from "../../../services/client/clientBookService";
import "../../../styles/client/client-header.css";

const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

/* ── Recursive category tree node ── */
const CatNode = ({ cat, onNavigate, level = 0 }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
  const pl = 16 + level * 16;
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: `10px 16px 10px ${pl}px`,
          borderBottom: "1px solid var(--c-border)",
          cursor: "pointer",
          userSelect: "none",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--c-hover)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {level === 0 &&
          (cat.thumbnail ? (
            <img
              src={cat.thumbnail}
              alt=""
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: "var(--c-accent-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: "0.65rem",
              }}
            >
              📂
            </div>
          ))}
        <span
          onClick={() => onNavigate(`/books/category/${cat.id}`)}
          style={{
            flex: 1,
            fontSize: level === 0 ? "0.875rem" : "0.82rem",
            fontWeight: level === 0 ? 600 : 400,
            color: level === 0 ? "var(--c-text)" : "var(--c-text-2)",
          }}
        >
          {cat.name}
        </span>
        {hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            style={{
              color: "var(--c-text-muted)",
              display: "flex",
              padding: 2,
            }}
          >
            <FiChevronDown
              size={13}
              style={{
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </span>
        )}
      </div>
      {hasChildren && open && (
        <div style={{ background: "var(--c-raised)" }}>
          {cat.children.map((child) => (
            <CatNode
              key={child.id}
              cat={child}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   ClientHeader
═══════════════════════════════════════════ */
const ClientHeader = ({ cartCount = 0, notifCount = 0 }) => {
  const { user, isAuthenticated, logout } = useClientAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  const [query, setQuery] = useState("");
  const [searchRes, setSearchRes] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res?.result ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))
        setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target))
        setUserOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setSearchRes([]);
      return;
    }
    try {
      setSearching(true);
      const list = await searchBooks(q.trim(), 8);
      setSearchRes(Array.isArray(list) ? list : []);
    } catch {
      setSearchRes([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) doSearch(query);
      else setSearchRes([]);
    }, 320);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      navigate(`/books?keyword=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const avatarLetter = (user?.username || "U")[0].toUpperCase();

  return (
    <header className="cl-header">
      <div className="cl-header-inner">
        {/* Logo */}
        <Link to="/" className="cl-header-logo">
          <div className="cl-header-logo-icon">
            <FiBookOpen size={19} />
          </div>
          BookeeShop
        </Link>

        {/* Trang chủ */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--c-raised)",
            color: "var(--c-text)",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            flexShrink: 0,
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--c-accent-bg)";
            e.currentTarget.style.borderColor = "var(--c-accent)";
            e.currentTarget.style.color = "var(--c-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--c-raised)";
            e.currentTarget.style.borderColor = "var(--c-border)";
            e.currentTarget.style.color = "var(--c-text)";
          }}
        >
          <FiHome size={15} /> Trang chủ
        </Link>

        {/* Danh mục */}
        <div
          className={`cl-cat-dropdown ${catOpen ? "open" : ""}`}
          ref={catRef}
        >
          <button className="cl-cat-btn" onClick={() => setCatOpen((o) => !o)}>
            <FiList size={15} /> Danh mục
            <FiChevronDown
              size={13}
              style={{
                transform: catOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>
          {catOpen && (
            <div
              className="cl-cat-menu"
              style={{ maxHeight: 480, overflowY: "auto" }}
            >
              {categories.length === 0 ? (
                <div
                  style={{
                    padding: "14px 16px",
                    color: "var(--c-text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  Đang tải...
                </div>
              ) : (
                categories.map((cat) => (
                  <CatNode
                    key={cat.id}
                    cat={cat}
                    onNavigate={(path) => {
                      navigate(path);
                      setCatOpen(false);
                    }}
                    level={0}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="cl-header-search" ref={searchRef}>
          <form
            className="cl-header-search-inner"
            onSubmit={handleSearchSubmit}
            autoComplete="off"
          >
            <span className="cl-header-search-icon">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              className="cl-header-search-input"
              placeholder="Tìm sách, tác giả..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                if (query) setSearchOpen(true);
              }}
            />
            <button type="submit" className="cl-search-submit">
              Tìm kiếm
            </button>
          </form>
          {searchOpen && query.trim() && (
            <div className="cl-search-dropdown">
              {searching ? (
                <div className="cl-search-empty">Đang tìm kiếm...</div>
              ) : searchRes.length === 0 ? (
                <div className="cl-search-empty">
                  Không tìm thấy kết quả cho "<strong>{query}</strong>"
                </div>
              ) : (
                <>
                  {searchRes.map((book) => (
                    <div
                      key={book.id}
                      className="cl-search-item"
                      onClick={() => {
                        navigate(`/books/${book.id}`);
                        setSearchOpen(false);
                        setQuery("");
                      }}
                    >
                      {book.thumbnail ? (
                        <img src={book.thumbnail} alt={book.title} />
                      ) : (
                        <div className="cl-search-item-img-ph">📚</div>
                      )}
                      <div className="cl-search-item-info">
                        <div className="cl-search-item-title">{book.title}</div>
                        {book.author && (
                          <div className="cl-search-item-author">
                            {book.author}
                          </div>
                        )}
                      </div>
                      <div className="cl-search-item-price">
                        {fmtPrice(book.finalPrice ?? book.price)}
                      </div>
                    </div>
                  ))}
                  <div
                    className="cl-search-footer"
                    onClick={handleSearchSubmit}
                  >
                    Xem tất cả kết quả cho "{query}" →
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="cl-header-actions">
          {isAuthenticated && (
            <>
              {/* Thông báo */}
              <button
                className="cl-header-icon-btn"
                title="Thông báo"
                onClick={() => navigate("/notifications")}
              >
                <FiBell size={18} />
                {notifCount > 0 && (
                  <span className="cl-header-badge">
                    {notifCount > 99 ? "99+" : notifCount}
                  </span>
                )}
              </button>
              {/* Giỏ hàng */}
              <button
                className="cl-header-icon-btn"
                title="Giỏ hàng"
                onClick={() => navigate("/cart")}
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="cl-header-badge">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </>
          )}

          {isAuthenticated ? (
            <div className="cl-user-dropdown" ref={userRef}>
              <button
                className="cl-user-btn"
                onClick={() => setUserOpen((o) => !o)}
              >
                <div className="cl-user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" />
                  ) : (
                    avatarLetter
                  )}
                </div>
                <span
                  style={{
                    maxWidth: 90,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.username?.split("@")[0] || "Tôi"}
                </span>
                <FiChevronDown
                  size={13}
                  style={{
                    color: "var(--c-text-muted)",
                    transform: userOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {userOpen && (
                <div className="cl-user-menu">
                  {/* Trang cá nhân */}
                  <Link
                    to="/profile"
                    className="cl-user-menu-item"
                    onClick={() => setUserOpen(false)}
                  >
                    <FiUser size={15} /> Trang cá nhân
                  </Link>
                  {/* Đơn hàng — không có Thông báo */}
                  <Link
                    to="/orders"
                    className="cl-user-menu-item"
                    onClick={() => setUserOpen(false)}
                  >
                    <FiPackage size={15} /> Đơn hàng của tôi
                  </Link>
                  <div className="cl-user-menu-divider" />
                  <button
                    className="cl-user-menu-item danger"
                    onClick={() => {
                      setUserOpen(false);
                      logout();
                    }}
                  >
                    <FiLogOut size={15} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="cl-user-btn"
              style={{ textDecoration: "none" }}
            >
              <div className="cl-user-avatar">
                <FiUser size={14} />
              </div>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;
