import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiAlertTriangle,
  FiRefreshCw,
  FiArrowLeft,
  FiZap,
} from "react-icons/fi";
import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  calcFinalPrice,
} from "../../../services/client/cartService";
import { useCart } from "../../../contexts/CartContext";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import "../../../styles/client/cart.css";

const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useClientAuth();
  const { refreshCart } = useCart();

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await getMyCart();
      const fetched = res?.result?.items ?? [];
      setItems(fetched);
      setSelected(new Set(fetched.map((i) => i.cartItemId)));
    } catch {
      setError("Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(
      selected.size === items.length
        ? new Set()
        : new Set(items.map((i) => i.cartItemId)),
    );

  const handleQtyChange = async (cartItemId, delta, currentQty) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      setUpdating(cartItemId);
      const res = await updateCartItem(cartItemId, newQty);
      setItems((prev) =>
        prev.map((i) =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: res?.result?.quantity ?? newQty }
            : i,
        ),
      );
      refreshCart();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "";
      showToast(
        msg.includes("INSUFFICIENT")
          ? "Số lượng vượt quá tồn kho."
          : "Cập nhật thất bại.",
        "error",
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      setRemoving(cartItemId);
      await removeCartItem(cartItemId);
      setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
      refreshCart();
      showToast("Đã xóa khỏi giỏ hàng.");
    } catch {
      showToast("Xóa thất bại.", "error");
    } finally {
      setRemoving(null);
    }
  };

  const handleRemoveSelected = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Xóa ${selected.size} sản phẩm đã chọn?`)) return;
    for (const id of selected) await handleRemove(id);
  };

  const selectedItems = items.filter((i) => selected.has(i.cartItemId));
  const subtotal = selectedItems.reduce((sum, i) => {
    const final = calcFinalPrice(i.book?.price, i.book?.discountPercentage);
    return sum + final * i.quantity;
  }, 0);
  const totalSaved = selectedItems.reduce((sum, i) => {
    if (!i.book?.discountPercentage || i.book.discountPercentage <= 0)
      return sum;
    return sum + i.book.price * (i.book.discountPercentage / 100) * i.quantity;
  }, 0);

  const handleCheckout = () => {
    if (!selectedItems.length) {
      showToast("Vui lòng chọn ít nhất 1 sản phẩm.", "error");
      return;
    }
    /* Truyền items đã chọn + subtotal sang CheckoutPage */
    navigate("/checkout", { state: { items: selectedItems, subtotal } });
  };

  if (loading) {
    return (
      <div className="cart-page client-container">
        <div className="cart-page-header">
          <h1 className="cart-title">Giỏ hàng của tôi</h1>
        </div>
        <div className="cart-skeleton-wrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="cart-skeleton-row">
              <div
                className="skeleton"
                style={{ width: 80, height: 100, borderRadius: 8 }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  className="skeleton"
                  style={{ height: 16, width: "60%" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 16, width: "30%" }}
                />
                <div className="skeleton" style={{ height: 32, width: 120 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page client-container">
      {toast && (
        <div className={`cart-toast${toast.type === "error" ? " error" : ""}`}>
          {toast.type === "error" ? "✕" : "✓"} {toast.msg}
        </div>
      )}

      <div className="cart-page-header">
        <div>
          <h1 className="cart-title">
            <FiShoppingCart size={22} /> Giỏ hàng của tôi
          </h1>
          {items.length > 0 && (
            <p className="cart-subtitle">{items.length} sản phẩm</p>
          )}
        </div>
        <button className="cart-back-btn" onClick={() => navigate("/books")}>
          <FiArrowLeft size={14} /> Tiếp tục mua sắm
        </button>
      </div>

      {error && (
        <div className="cart-alert-error">
          <FiAlertTriangle size={14} /> {error}
          <button className="cart-retry-btn" onClick={fetchCart}>
            <FiRefreshCw size={13} /> Thử lại
          </button>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🔐</div>
          <p>Vui lòng đăng nhập để xem giỏ hàng.</p>
          <Link to="/auth/login" className="cart-login-btn">
            Đăng nhập
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <p>Giỏ hàng của bạn đang trống.</p>
          <Link to="/books" className="cart-login-btn">
            Khám phá sách ngay
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-col">
            <div className="cart-toolbar">
              <label className="cart-select-all">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={toggleAll}
                />
                Chọn tất cả ({items.length})
              </label>
              {selected.size > 0 && (
                <button
                  className="cart-delete-selected"
                  onClick={handleRemoveSelected}
                >
                  <FiTrash2 size={13} /> Xóa đã chọn ({selected.size})
                </button>
              )}
            </div>

            {items.map((item) => {
              const book = item.book;
              const finalPrice = calcFinalPrice(
                book?.price,
                book?.discountPercentage,
              );
              const isUpdating = updating === item.cartItemId;
              const isRemoving = removing === item.cartItemId;
              const isChecked = selected.has(item.cartItemId);
              return (
                <div
                  key={item.cartItemId}
                  className={`cart-item${isChecked ? " selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    className="cart-item-check"
                    checked={isChecked}
                    onChange={() => toggleSelect(item.cartItemId)}
                  />
                  <Link
                    to={`/books/${book?.id}`}
                    className="cart-item-thumb-link"
                  >
                    {book?.thumbnail ? (
                      <img
                        src={book.thumbnail}
                        alt={book?.title}
                        className="cart-item-thumb"
                      />
                    ) : (
                      <div className="cart-item-thumb-ph">📚</div>
                    )}
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/books/${book?.id}`} className="cart-item-title">
                      {book?.title ?? "—"}
                    </Link>
                    <div className="cart-item-price-row">
                      <span className="cart-item-final">
                        {fmtPrice(finalPrice)}
                      </span>
                      {book?.discountPercentage > 0 && (
                        <>
                          <span className="cart-item-orig">
                            {fmtPrice(book.price)}
                          </span>
                          <span className="cart-item-disc-badge">
                            -{Math.round(book.discountPercentage)}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="cart-qty-row">
                      <div className="cart-qty-ctrl">
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            handleQtyChange(item.cartItemId, -1, item.quantity)
                          }
                          disabled={item.quantity <= 1 || isUpdating}
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="cart-qty-val">
                          {isUpdating ? (
                            <div className="cart-qty-spinner" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          className="cart-qty-btn"
                          onClick={() =>
                            handleQtyChange(item.cartItemId, 1, item.quantity)
                          }
                          disabled={isUpdating}
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <span className="cart-item-subtotal">
                        {fmtPrice(finalPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(item.cartItemId)}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <div
                        className="cart-qty-spinner"
                        style={{ borderTopColor: "var(--c-danger)" }}
                      />
                    ) : (
                      <FiTrash2 size={15} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">Tóm tắt đơn hàng</h3>
              <div className="cart-summary-row">
                <span>Sản phẩm đã chọn</span>
                <span>{selectedItems.length}</span>
              </div>
              <div className="cart-summary-row">
                <span>Tạm tính</span>
                <span>{fmtPrice(subtotal + totalSaved)}</span>
              </div>
              {totalSaved > 0 && (
                <div className="cart-summary-row discount">
                  <span>Tiết kiệm</span>
                  <span>-{fmtPrice(totalSaved)}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span>Phí vận chuyển</span>
                <span className="cart-free-ship">Miễn phí</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-total-row">
                <span>Tổng cộng</span>
                <span className="cart-summary-total">{fmtPrice(subtotal)}</span>
              </div>
              {totalSaved > 0 && (
                <p className="cart-summary-saved">
                  Bạn tiết kiệm {fmtPrice(totalSaved)}
                </p>
              )}
              <button
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={!selectedItems.length}
              >
                <FiZap size={16} /> Thanh toán ({selectedItems.length})
              </button>
              <p className="cart-summary-note">
                🔒 Thanh toán an toàn, bảo mật
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
