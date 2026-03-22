import React, { useState, useEffect, useRef } from "react";
import { FiMinus, FiPlus, FiShoppingCart, FiX } from "react-icons/fi";
import { addToCart } from "../../../services/client/cartService";
import { useCart } from "../../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

const calcFinal = (price, disc) => {
  if (!price) return 0;
  if (!disc || disc <= 0) return price;
  return Math.round(price * (1 - disc / 100) * 100) / 100;
};

const AddToCartPopup = ({ book, anchorRef, onClose }) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const popupRef = useRef();

  const maxQty = book?.stock ?? 99;
  const finalPrice = calcFinal(book?.price, book?.discountPercentage);

  useEffect(() => {
    const h = (e) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [anchorRef, onClose]);

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError("");
      await addToCart(book.id, qty);
      await refreshCart();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.includes("OUT_OF_STOCK") || msg.includes("BOOK_OUT_OF_STOCK")) {
        setError("Sách này đã hết hàng.");
      } else if (msg.includes("INSUFFICIENT_STOCK")) {
        setError(`Chỉ còn ${maxQty} cuốn trong kho.`);
      } else {
        setError("Thêm vào giỏ hàng thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={popupRef} className="acp-popup">
      {/* Header */}
      <div className="acp-header">
        <div className="acp-book-info">
          {book?.thumbnail && (
            <img src={book.thumbnail} alt={book.title} className="acp-thumb" />
          )}
          <div className="acp-book-meta">
            <p className="acp-book-title">{book?.title}</p>
            <div className="acp-price-row">
              <span className="acp-final">{fmtPrice(finalPrice)}</span>
              {book?.discountPercentage > 0 && (
                <span className="acp-orig">{fmtPrice(book.price)}</span>
              )}
            </div>
          </div>
        </div>
        <button className="acp-close" onClick={onClose}>
          <FiX size={15} />
        </button>
      </div>

      {/* Quantity picker */}
      <div className="acp-qty-row">
        <span className="acp-qty-label">Số lượng</span>
        <div className="acp-qty-ctrl">
          <button
            className="acp-qty-btn"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
          >
            <FiMinus size={13} />
          </button>
          <input
            className="acp-qty-input"
            type="number"
            min={1}
            max={maxQty}
            value={qty}
            onChange={(e) => {
              const v = Math.max(
                1,
                Math.min(maxQty, Number(e.target.value) || 1),
              );
              setQty(v);
            }}
          />
          <button
            className="acp-qty-btn"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
          >
            <FiPlus size={13} />
          </button>
        </div>
        <span className="acp-stock-hint">Kho: {maxQty}</span>
      </div>

      {/* Subtotal */}
      <div className="acp-subtotal">
        Tạm tính: <strong>{fmtPrice(finalPrice * qty)}</strong>
      </div>

      {error && <p className="acp-error">{error}</p>}

      {/* Actions */}
      <div className="acp-actions">
        <button
          className="acp-btn-add"
          onClick={handleAdd}
          disabled={loading || success}
        >
          {loading ? (
            <div className="acp-spinner" />
          ) : success ? (
            "✓ Đã thêm!"
          ) : (
            <>
              <FiShoppingCart size={14} /> Thêm vào giỏ
            </>
          )}
        </button>
        <button
          className="acp-btn-view"
          onClick={() => {
            onClose();
            navigate("/cart");
          }}
        >
          Xem giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default AddToCartPopup;
