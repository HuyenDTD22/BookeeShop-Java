import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiZap } from "react-icons/fi";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import AddToCartPopup from "./AddToCartPopup";

const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

const Stars = ({ rating = 0 }) => {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span style={{ fontSize: "0.7rem", letterSpacing: 1 }}>
      {"★"
        .repeat(full)
        .split("")
        .map((s, i) => (
          <span key={`f${i}`} style={{ color: "#f59e0b" }}>
            {s}
          </span>
        ))}
      {"☆"
        .repeat(5 - full)
        .split("")
        .map((s, i) => (
          <span key={`e${i}`} style={{ color: "#dde3ee" }}>
            {s}
          </span>
        ))}
    </span>
  );
};

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useClientAuth();
  const [showPopup, setShowPopup] = useState(false);
  const cartBtnRef = useRef();

  const handleAddCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    setShowPopup((s) => !s);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    navigate("/checkout", { state: { bookId: book.id, quantity: 1 } });
  };

  return (
    <div style={{ position: "relative" }}>
      <Link
        to={`/books/${book.id}`}
        style={{ textDecoration: "none", display: "block", height: "100%" }}
      >
        <div className="cl-book-card">
          {/* Image */}
          <div className="cl-book-card-img-wrap">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} loading="lazy" />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.5rem",
                  background: "var(--c-raised)",
                  color: "var(--c-text-muted)",
                }}
              >
                📚
              </div>
            )}
            {book.discountPercentage > 0 && (
              <span className="cl-book-card-badge">
                -{Math.round(book.discountPercentage)}%
              </span>
            )}
            {!book.inStock && (
              <span className="cl-book-card-badge out">Hết hàng</span>
            )}
          </div>

          {/* Body */}
          <div className="cl-book-card-body">
            <div className="cl-book-card-title">{book.title}</div>
            {book.author && (
              <div className="cl-book-card-author">{book.author}</div>
            )}

            <div className="cl-book-card-price-row">
              <span className="cl-book-card-final">
                {fmtPrice(book.finalPrice ?? book.price)}
              </span>
              {book.discountPercentage > 0 && book.price && (
                <span className="cl-book-card-original">
                  {fmtPrice(book.price)}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Stars rating={book.averageRating ?? 0} />
              {book.totalRatings > 0 && (
                <span
                  style={{ fontSize: "0.68rem", color: "var(--c-text-muted)" }}
                >
                  ({book.totalRatings})
                </span>
              )}
              {book.purchaseCount > 0 && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--c-text-muted)",
                    marginLeft: "auto",
                  }}
                >
                  Đã bán{" "}
                  {book.purchaseCount > 999
                    ? `${Math.floor(book.purchaseCount / 1000)}k`
                    : book.purchaseCount}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button
                ref={cartBtnRef}
                onClick={handleAddCart}
                disabled={!book.inStock}
                style={{
                  flex: 1,
                  padding: "7px 4px",
                  background: showPopup
                    ? "var(--c-accent)"
                    : !book.inStock
                      ? "var(--c-raised)"
                      : "var(--c-accent-bg)",
                  color: showPopup
                    ? "#fff"
                    : !book.inStock
                      ? "var(--c-text-muted)"
                      : "var(--c-accent)",
                  border: `1px solid ${!book.inStock ? "var(--c-border)" : "var(--c-accent)"}`,
                  borderRadius: "var(--radius-sm)",
                  cursor: !book.inStock ? "not-allowed" : "pointer",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <FiShoppingCart size={12} /> Giỏ hàng
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!book.inStock}
                style={{
                  flex: 1,
                  padding: "7px 4px",
                  background: !book.inStock
                    ? "var(--c-raised)"
                    : "rgba(239,68,68,0.08)",
                  color: !book.inStock
                    ? "var(--c-text-muted)"
                    : "var(--c-danger)",
                  border: `1px solid ${!book.inStock ? "var(--c-border)" : "var(--c-danger)"}`,
                  borderRadius: "var(--radius-sm)",
                  cursor: !book.inStock ? "not-allowed" : "pointer",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (book.inStock) {
                    e.currentTarget.style.background = "var(--c-danger)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (book.inStock) {
                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                    e.currentTarget.style.color = "var(--c-danger)";
                  }
                }}
              >
                <FiZap size={12} /> Mua ngay
              </button>
            </div>
          </div>
        </div>
      </Link>

      {showPopup && (
        <AddToCartPopup
          book={book}
          anchorRef={cartBtnRef}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default BookCard;
