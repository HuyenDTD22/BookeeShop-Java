import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FiMapPin,
  FiPhone,
  FiUser,
  FiFileText,
  FiTruck,
  FiCreditCard,
  FiChevronRight,
  FiAlertCircle,
  FiEdit2,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import { getMyProfile } from "../../../services/client/orderService";
import { createOrder } from "../../../services/client/orderService";
import { getBookById } from "../../../services/client/clientBookService";
import { calcFinalPrice } from "../../../services/client/cartService";
import { useCart } from "../../../contexts/CartContext";
import "../../../styles/client/checkout.css";

/* ── helpers ── */
const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";

const calcFinal = (price, disc) => {
  if (!price) return 0;
  if (!disc || disc <= 0) return price;
  return Math.round(price * (1 - disc / 100) * 100) / 100;
};

/* ─────────────────────────────────────────────────────────────────
   Field component
───────────────────────────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="co-field">
    <label className="co-label">
      {label}
      {required && <span className="co-required">*</span>}
    </label>
    {children}
    {error && <p className="co-field-error">{error}</p>}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   PaymentMethod selector
───────────────────────────────────────────────────────────────── */
const PaymentMethodCard = ({
  value,
  selected,
  onSelect,
  icon,
  title,
  desc,
}) => (
  <div
    className={`co-pay-card${selected ? " selected" : ""}`}
    onClick={() => onSelect(value)}
  >
    <div className="co-pay-radio">
      {selected && <div className="co-pay-radio-dot" />}
    </div>
    <div className="co-pay-icon">{icon}</div>
    <div className="co-pay-text">
      <span className="co-pay-title">{title}</span>
      <span className="co-pay-desc">{desc}</span>
    </div>
    {selected && <FiCheck size={16} className="co-pay-check" />}
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   VNPay result page (rendered after redirect back)
───────────────────────────────────────────────────────────────── */
const VNPayResultPage = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("vnp_ResponseCode");
  const orderId = params.get("vnp_TxnRef");
  const success = code === "00";

  return (
    <div className="co-result-wrap client-container">
      <div className={`co-result-card${success ? " success" : " failed"}`}>
        <div className="co-result-icon">{success ? "✓" : "✕"}</div>
        <h2 className="co-result-title">
          {success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h2>
        <p className="co-result-sub">
          {success
            ? `Đơn hàng #${orderId?.slice(0, 8).toUpperCase()} đã được xác nhận.`
            : "Giao dịch không thành công. Vui lòng thử lại."}
        </p>
        <div className="co-result-actions">
          {success && (
            <button
              className="co-result-btn primary"
              onClick={() => navigate("/orders")}
            >
              Xem đơn hàng
            </button>
          )}
          <button
            className={`co-result-btn${success ? " secondary" : " primary"}`}
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CheckoutPage
═══════════════════════════════════════════════════════════════ */
const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  /* ── Detect VNPay return URL sớm (không dùng early return trước hooks) ── */
  const isVNPayReturn = location.search.includes("vnp_ResponseCode");

  /* ── Parse state từ navigate ── */
  const state = location.state ?? {};
  const isBuyNow = Boolean(state.bookId);
  const isFromCart = Boolean(state.items?.length);

  /* ── Tất cả hooks phải khai báo ở đây, TRƯỚC mọi conditional return ── */
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [payMethod, setPayMethod] = useState("COD");
  const [profileLoading, setProfileLoading] = useState(true);

  /* Cho luồng mua ngay */
  const [buyNowBook, setBuyNowBook] = useState(null);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  /* ── Load profile — bỏ qua nếu là VNPay return ── */
  useEffect(() => {
    if (isVNPayReturn) return;
    getMyProfile()
      .then((res) => {
        const p = res?.result ?? {};
        setForm((prev) => ({
          ...prev,
          fullName: p.fullName ?? "",
          phone: p.phone ?? "",
          address: p.address ?? "",
        }));
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [isVNPayReturn]);

  /* ── Load book cho "mua ngay" — bỏ qua nếu là VNPay return ── */
  useEffect(() => {
    if (isVNPayReturn || !isBuyNow) return;
    setBuyNowLoading(true);
    getBookById(state.bookId)
      .then((res) => setBuyNowBook(res?.result ?? null))
      .catch(() => {})
      .finally(() => setBuyNowLoading(false));
  }, [isVNPayReturn, isBuyNow, state.bookId]);

  /* ── Nếu là VNPay return → hiện result page (sau tất cả hooks) ── */
  if (isVNPayReturn) {
    return <VNPayResultPage />;
  }

  /* ── Tính tóm tắt đơn ── */
  const orderItems = isBuyNow
    ? buyNowBook
      ? [
          {
            id: buyNowBook.id,
            title: buyNowBook.title,
            thumbnail: buyNowBook.thumbnail,
            price: buyNowBook.price,
            discountPercentage: buyNowBook.discountPercentage,
            finalPrice:
              buyNowBook.finalPrice ??
              calcFinal(buyNowBook.price, buyNowBook.discountPercentage),
            quantity: state.quantity ?? 1,
          },
        ]
      : []
    : (state.items ?? []).map((i) => ({
        id: i.book?.id,
        cartItemId: i.cartItemId,
        title: i.book?.title,
        thumbnail: i.book?.thumbnail,
        price: i.book?.price,
        discountPercentage: i.book?.discountPercentage,
        finalPrice: calcFinal(i.book?.price, i.book?.discountPercentage),
        quantity: i.quantity,
      }));

  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.finalPrice ?? item.price ?? 0) * item.quantity,
    0,
  );

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!form.phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
    else if (!/^\d{10,11}$/.test(form.phone.trim()))
      e.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ";
    return e;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      setSubmitError("");

      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim() || null,
        paymentMethod: payMethod,
        ...(isBuyNow
          ? { bookId: state.bookId, quantity: state.quantity ?? 1 }
          : { cartItemIds: state.items.map((i) => i.cartItemId) }),
      };

      const res = await createOrder(payload);
      const result = res?.result;

      if (payMethod === "VNPAY") {
        /* result = VNPay URL → redirect sang cổng thanh toán */
        if (result && result.startsWith("http")) {
          window.location.href = result;
        } else {
          setSubmitError("Không thể tạo liên kết thanh toán VNPay.");
        }
        return;
      }

      /* COD → result = orderId */
      await refreshCart();
      setOrderSuccess({ orderId: result });
    } catch (err) {
      const msg = err?.response?.data?.message ?? "";
      if (msg.includes("INSUFFICIENT_STOCK") || msg.includes("OUT_OF_STOCK")) {
        setSubmitError("Một số sản phẩm trong đơn hàng đã hết hàng.");
      } else if (msg.includes("BOOK_NOT_AVAILABLE")) {
        setSubmitError("Một số sản phẩm không còn khả dụng.");
      } else {
        setSubmitError("Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── COD success screen ── */
  if (orderSuccess) {
    return (
      <div className="co-result-wrap client-container">
        <div className="co-result-card success">
          <div className="co-result-icon">✓</div>
          <h2 className="co-result-title">Đặt hàng thành công!</h2>
          <p className="co-result-sub">
            Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
          </p>
          <div className="co-result-actions">
            <button
              className="co-result-btn primary"
              onClick={() => navigate("/orders")}
            >
              Xem đơn hàng
            </button>
            <button
              className="co-result-btn secondary"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Guard: không có item nào ── */
  if (!isBuyNow && !isFromCart) {
    return (
      <div className="co-result-wrap client-container">
        <div className="co-result-card failed">
          <div className="co-result-icon">!</div>
          <h2 className="co-result-title">Không có sản phẩm nào</h2>
          <p className="co-result-sub">
            Vui lòng chọn sản phẩm trước khi thanh toán.
          </p>
          <div className="co-result-actions">
            <button
              className="co-result-btn primary"
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loading = profileLoading || buyNowLoading;

  return (
    <div className="co-page client-container">
      {/* Breadcrumb */}
      <nav className="co-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        {isFromCart && (
          <>
            <Link to="/cart">Giỏ hàng</Link>
            <span>›</span>
          </>
        )}
        <span>Thanh toán</span>
      </nav>

      <h1 className="co-title">Thanh toán đơn hàng</h1>

      {loading ? (
        <div className="co-skeleton-wrap">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="co-skeleton"
              style={{ height: 56, marginBottom: 14 }}
            />
          ))}
        </div>
      ) : (
        <div className="co-layout">
          {/* ══════════════════════════════════════
              LEFT: Form thông tin + thanh toán
          ══════════════════════════════════════ */}
          <div className="co-left">
            {/* ── Thông tin giao hàng ── */}
            <div className="co-section">
              <div className="co-section-header">
                <FiMapPin size={16} style={{ color: "var(--c-accent)" }} />
                <h2 className="co-section-title">Thông tin giao hàng</h2>
                <span className="co-section-hint">
                  <FiEdit2 size={12} /> Điền từ tài khoản, có thể chỉnh sửa
                </span>
              </div>

              <div className="co-form-grid">
                <Field label="Họ và tên" required error={errors.fullName}>
                  <div className="co-input-wrap">
                    <FiUser size={15} className="co-input-icon" />
                    <input
                      className={`co-input${errors.fullName ? " error" : ""}`}
                      placeholder="Nguyễn Văn A"
                      value={form.fullName}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, fullName: e.target.value }));
                        if (errors.fullName)
                          setErrors((p) => ({ ...p, fullName: "" }));
                      }}
                    />
                  </div>
                </Field>

                <Field label="Số điện thoại" required error={errors.phone}>
                  <div className="co-input-wrap">
                    <FiPhone size={15} className="co-input-icon" />
                    <input
                      className={`co-input${errors.phone ? " error" : ""}`}
                      placeholder="0xxxxxxxxx"
                      value={form.phone}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, phone: e.target.value }));
                        if (errors.phone)
                          setErrors((p) => ({ ...p, phone: "" }));
                      }}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Địa chỉ giao hàng" required error={errors.address}>
                <div className="co-input-wrap">
                  <FiMapPin size={15} className="co-input-icon" />
                  <input
                    className={`co-input${errors.address ? " error" : ""}`}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={form.address}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, address: e.target.value }));
                      if (errors.address)
                        setErrors((p) => ({ ...p, address: "" }));
                    }}
                  />
                </div>
              </Field>

              <Field label="Ghi chú đơn hàng">
                <div className="co-input-wrap">
                  <FiFileText size={15} className="co-input-icon" />
                  <textarea
                    className="co-input co-textarea"
                    placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                    value={form.note}
                    rows={3}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, note: e.target.value }))
                    }
                  />
                </div>
              </Field>
            </div>

            {/* ── Phương thức thanh toán ── */}
            <div className="co-section">
              <div className="co-section-header">
                <FiCreditCard size={16} style={{ color: "var(--c-accent)" }} />
                <h2 className="co-section-title">Phương thức thanh toán</h2>
              </div>

              <div className="co-pay-methods">
                <PaymentMethodCard
                  value="COD"
                  selected={payMethod === "COD"}
                  onSelect={setPayMethod}
                  icon={<span style={{ fontSize: "1.4rem" }}>💵</span>}
                  title="Thanh toán khi nhận hàng (COD)"
                  desc="Trả tiền mặt khi nhận được hàng"
                />
                <PaymentMethodCard
                  value="VNPAY"
                  selected={payMethod === "VNPAY"}
                  onSelect={setPayMethod}
                  icon={
                    <div
                      style={{
                        width: 52,
                        height: 32,
                        background:
                          "linear-gradient(135deg, #005BAA 0%, #0078D4 100%)",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        fontFamily: "'Arial', sans-serif",
                        letterSpacing: "0.02em",
                        boxShadow: "0 2px 6px rgba(0,91,170,0.3)",
                      }}
                    >
                      <span style={{ color: "#fff" }}>VN</span>
                      <span style={{ color: "#FFD700" }}>PAY</span>
                    </div>
                  }
                  title="Thanh toán qua VNPay"
                  desc="ATM / thẻ tín dụng / ví điện tử"
                />
              </div>

              {payMethod === "VNPAY" && (
                <div className="co-vnpay-note">
                  <FiAlertCircle size={14} />
                  <span>
                    Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất
                    giao dịch.
                  </span>
                </div>
              )}
            </div>

            {/* ── Vận chuyển ── */}
            <div className="co-section">
              <div className="co-section-header">
                <FiTruck size={16} style={{ color: "var(--c-accent)" }} />
                <h2 className="co-section-title">Phương thức vận chuyển</h2>
              </div>
              <div className="co-ship-row">
                <div className="co-ship-info">
                  <span className="co-ship-name">🚚 Giao hàng tiêu chuẩn</span>
                  <span className="co-ship-eta">Dự kiến 3–5 ngày làm việc</span>
                </div>
                <span className="co-ship-free">Miễn phí</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              RIGHT: Tóm tắt đơn hàng
          ══════════════════════════════════════ */}
          <div className="co-right">
            <div className="co-summary-card">
              <h3 className="co-summary-title">
                Tóm tắt đơn hàng
                <span className="co-summary-count">
                  ({orderItems.length} sản phẩm)
                </span>
              </h3>

              {/* Danh sách sản phẩm */}
              <div className="co-item-list">
                {orderItems.map((item, i) => (
                  <div key={item.id ?? i} className="co-item-row">
                    <div className="co-item-thumb-wrap">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="co-item-thumb"
                        />
                      ) : (
                        <div className="co-item-thumb-ph">📚</div>
                      )}
                      <span className="co-item-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="co-item-meta">
                      <span className="co-item-title">{item.title}</span>
                      {item.discountPercentage > 0 && (
                        <span className="co-item-orig">
                          {fmtPrice(item.price)}
                        </span>
                      )}
                    </div>
                    <span className="co-item-price">
                      {fmtPrice(
                        (item.finalPrice ?? item.price) * item.quantity,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="co-summary-divider" />

              {/* Tính tiền */}
              <div className="co-summary-row">
                <span>Tạm tính</span>
                <span>{fmtPrice(subtotal)}</span>
              </div>
              <div className="co-summary-row">
                <span>Phí vận chuyển</span>
                <span className="co-free-ship">Miễn phí</span>
              </div>

              <div className="co-summary-divider" />

              <div className="co-summary-total-row">
                <span>Tổng cộng</span>
                <span className="co-summary-total">{fmtPrice(subtotal)}</span>
              </div>
              <p className="co-summary-vat">(Đã bao gồm VAT)</p>

              {submitError && (
                <div className="co-submit-error">
                  <FiAlertCircle size={14} /> {submitError}
                </div>
              )}

              {/* Nút đặt hàng */}
              <button
                className="co-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="co-spinner" /> Đang xử lý...
                  </>
                ) : payMethod === "VNPAY" ? (
                  <>
                    Thanh toán qua VNPay <FiChevronRight size={16} />
                  </>
                ) : (
                  <>
                    Đặt hàng <FiChevronRight size={16} />
                  </>
                )}
              </button>

              <p className="co-terms">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <Link to="/terms">Điều khoản dịch vụ</Link> của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
