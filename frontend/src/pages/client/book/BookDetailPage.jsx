import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiShoppingCart,
  FiZap,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiImage,
  FiCornerDownRight,
  FiTrash2,
  FiAlertCircle,
  FiArrowLeft,
  FiSmile,
  FiSend,
} from "react-icons/fi";
import {
  getBookById,
  getRatingsByBookId,
  getCommentsByBookId,
  createComment,
  deleteComment,
} from "../../../services/client/clientBookService";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import AddToCartPopup from "../../../components/client/book/AddToCartPopup";
import "../../../styles/client/book-detail.css";

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

const timeAgo = (str) => {
  if (!str) return "";
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(str));
};

const Stars = ({ value = 0, size = 16 }) => {
  const display = Math.round(Math.min(5, Math.max(0, value)));
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={size}
          fill={s <= display ? "#f59e0b" : "transparent"}
          color={s <= display ? "#f59e0b" : "#cbd5e1"}
          style={{ flexShrink: 0 }}
        />
      ))}
    </span>
  );
};

const InfoRow = ({ label, value }) =>
  value ? (
    <div className="bd-info-row">
      <span className="bd-info-label">{label}</span>
      <span className="bd-info-value">{value}</span>
    </div>
  ) : null;

const RatingBar = ({ stars, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bd-rating-bar-row">
      <span className="bd-rating-bar-label">{stars} ★</span>
      <div className="bd-rating-bar-track">
        <div className="bd-rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bd-rating-bar-count">{count}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   EmojiPicker
───────────────────────────────────────────────────────────────── */
const EMOJI_GROUPS = [
  {
    label: "Cảm xúc",
    emojis: [
      "😀",
      "😂",
      "🥹",
      "😍",
      "🥰",
      "😎",
      "🤔",
      "😮",
      "😢",
      "😡",
      "😴",
      "🤩",
      "🙄",
      "😬",
      "🥳",
      "🤯",
      "😱",
      "🙏",
      "👍",
      "👎",
    ],
  },
  {
    label: "Tay",
    emojis: [
      "👋",
      "✌️",
      "🤞",
      "🤟",
      "🤙",
      "👌",
      "🤌",
      "🤏",
      "👏",
      "🙌",
      "🤝",
      "💪",
      "🫶",
      "❤️",
      "🔥",
      "⭐",
      "✨",
      "💯",
      "🎉",
      "🎊",
    ],
  },
  {
    label: "Động vật",
    emojis: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐙",
      "🦋",
      "🌸",
      "🌺",
      "🍀",
      "🌈",
    ],
  },
  {
    label: "Đồ vật",
    emojis: [
      "📚",
      "📖",
      "✏️",
      "📝",
      "💡",
      "🎯",
      "🎮",
      "🎵",
      "🎶",
      "🏆",
      "🥇",
      "⚡",
      "💎",
      "🔑",
      "🎁",
      "🍕",
      "🍔",
      "☕",
      "🍜",
      "🎂",
    ],
  },
];

const EmojiPicker = ({ onSelect, onClose }) => {
  const [tab, setTab] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div className="bd-emoji-picker" ref={ref}>
      <div className="bd-emoji-tabs">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={i}
            className={`bd-emoji-tab${tab === i ? " active" : ""}`}
            onClick={() => setTab(i)}
          >
            {g.label}
          </button>
        ))}
        <button className="bd-emoji-close" onClick={onClose}>
          <FiX size={13} />
        </button>
      </div>
      <div className="bd-emoji-grid">
        {EMOJI_GROUPS[tab].emojis.map((em) => (
          <button
            key={em}
            className="bd-emoji-btn"
            onClick={() => onSelect(em)}
          >
            {em}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   CommentForm
───────────────────────────────────────────────────────────────── */
const CommentForm = ({
  bookId,
  parentId = null,
  parentDisplayName = null,
  placeholder = "Viết bình luận...",
  onSuccess,
  onCancel,
  user,
  autoFocus = false,
}) => {
  const [text, setText] = useState(
    parentDisplayName ? `@${parentDisplayName} ` : "",
  );
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef();
  const imgRef = useRef();

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart,
      e2 = el.selectionEnd;
    const next = text.slice(0, s) + emoji + text.slice(e2);
    setText(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + emoji.length, s + emoji.length);
    }, 0);
    setShowEmoji(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSend = async () => {
    if (!text.trim() && !img) return;
    try {
      setSending(true);
      setError("");
      await createComment(bookId, text.trim(), parentId, img);
      setText("");
      setImg(null);
      setImgPreview("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      onSuccess?.();
    } catch (err) {
      const msg = String(err?.response?.data?.message ?? "");
      setError(
        msg.includes("PURCHASED") || msg.includes("NOT_PURCHASED")
          ? "Bạn cần mua và nhận sách trước khi bình luận."
          : "Gửi thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSending(false);
    }
  };

  const canSend = (text.trim() || img) && !sending;

  return (
    <div className="bd-fb-form">
      <div className="bd-fb-avatar">
        {user?.avatar ? (
          <img src={user.avatar} alt="" />
        ) : (
          <span>
            {(user?.fullName || user?.username || "U")[0].toUpperCase()}
          </span>
        )}
      </div>
      <div className="bd-fb-input-wrap">
        <div className="bd-fb-input-box">
          <textarea
            ref={textareaRef}
            className="bd-fb-textarea"
            placeholder={placeholder}
            value={text}
            rows={1}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel?.();
            }}
          />
          <div className="bd-fb-input-icons">
            <div style={{ position: "relative" }}>
              <button
                className={`bd-fb-icon-btn${showEmoji ? " active" : ""}`}
                onClick={() => setShowEmoji((s) => !s)}
                title="Chọn emoji"
                type="button"
              >
                <FiSmile size={18} />
              </button>
              {showEmoji && (
                <EmojiPicker
                  onSelect={insertEmoji}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>
            <button
              className="bd-fb-icon-btn"
              onClick={() => imgRef.current?.click()}
              title="Đính kèm ảnh"
              type="button"
            >
              <FiImage size={18} />
            </button>
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                setImg(f);
                setImgPreview(URL.createObjectURL(f));
              }}
            />
            <button
              className={`bd-fb-send-btn${canSend ? " active" : ""}`}
              onClick={handleSend}
              disabled={!canSend}
              title="Gửi bình luận"
              type="button"
            >
              {sending ? (
                <div
                  className="bd-spinner-sm"
                  style={{ borderTopColor: "var(--c-accent)" }}
                />
              ) : (
                <FiSend size={15} />
              )}
            </button>
          </div>
        </div>
        {imgPreview && (
          <div className="bd-fb-img-preview">
            <img src={imgPreview} alt="" />
            <button
              className="bd-img-remove"
              onClick={() => {
                setImg(null);
                setImgPreview("");
              }}
            >
              <FiX size={10} />
            </button>
          </div>
        )}
        {error && (
          <p className="bd-rating-error" style={{ marginTop: 4 }}>
            {error}
          </p>
        )}
        <p className="bd-fb-hint">
          <kbd>Enter</kbd> xuống dòng · Click{" "}
          <FiSend size={10} style={{ verticalAlign: "middle" }} /> để gửi
          {onCancel && (
            <>
              {" "}
              ·{" "}
              <button className="bd-fb-cancel-link" onClick={onCancel}>
                Hủy
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   CommentItem
───────────────────────────────────────────────────────────────── */
const CommentItem = ({
  comment,
  bookId,
  currentUserId,
  onMutated,
  depth = 0,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showChildren, setShowChildren] = useState(true);

  const isDeleted = Boolean(comment.deleted);
  const isOwner = comment.user?.id === currentUserId;
  const displayName =
    comment.user?.fullName || comment.user?.username || "Ẩn danh";

  const countChildren = (c) => {
    let n = c.children?.length ?? 0;
    c.children?.forEach((ch) => {
      n += countChildren(ch);
    });
    return n;
  };
  const childCount = countChildren(comment);
  const indentPx = Math.min(depth, 3) * 40;

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      setDeleting(true);
      await deleteComment(comment.id);
      onMutated?.();
    } catch {
      /* silent */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ marginBottom: depth === 0 ? 16 : 10 }}>
      <div className="bd-comment-item">
        <div className="bd-comment-header">
          <div className="bd-comment-avatar">
            {comment.user?.avatar ? (
              <img src={comment.user.avatar} alt="" />
            ) : (
              <span>{displayName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              <span className="bd-comment-name">{displayName}</span>
              {depth > 0 && comment.parentDisplayName && (
                <span className="bd-replying-badge">
                  <FiCornerDownRight size={10} /> {comment.parentDisplayName}
                </span>
              )}
            </div>
            <span className="bd-comment-time">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          {isOwner && !isDeleted && (
            <button
              className="bd-comment-del-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <div className="bd-spinner-sm" />
              ) : (
                <FiTrash2 size={13} />
              )}
            </button>
          )}
        </div>
        {isDeleted ? (
          <p className="bd-comment-deleted">[Bình luận đã bị xóa]</p>
        ) : (
          <p className="bd-comment-content">{comment.content}</p>
        )}
        {!isDeleted && (
          <button
            className="bd-reply-btn"
            onClick={() => setShowReply((s) => !s)}
          >
            <FiCornerDownRight size={12} /> {showReply ? "Hủy" : "Trả lời"}
          </button>
        )}
        {showReply && (
          <div style={{ marginTop: 10 }}>
            <CommentForm
              bookId={bookId}
              parentId={comment.id}
              parentDisplayName={displayName}
              placeholder={`Trả lời ${displayName}...`}
              onSuccess={() => {
                setShowReply(false);
                onMutated?.();
              }}
              onCancel={() => setShowReply(false)}
              autoFocus
            />
          </div>
        )}
      </div>
      {!isDeleted && comment.thumbnail && (
        <div className="bd-comment-img-outside">
          <img src={comment.thumbnail} alt="Ảnh đính kèm" />
        </div>
      )}
      {childCount > 0 && (
        <div
          className="bd-comment-children"
          style={{ paddingLeft: indentPx + 44 }}
        >
          <button
            className="bd-toggle-children"
            onClick={() => setShowChildren((s) => !s)}
          >
            {showChildren ? (
              <FiChevronUp size={12} />
            ) : (
              <FiChevronDown size={12} />
            )}
            {showChildren ? "Ẩn" : "Xem"} {childCount} phản hồi
          </button>
          {showChildren &&
            comment.children?.map((child) => (
              <CommentItem
                key={child.id}
                comment={{ ...child, parentDisplayName: displayName }}
                bookId={bookId}
                currentUserId={currentUserId}
                onMutated={onMutated}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BookDetailPage
═══════════════════════════════════════════════════════════════ */
const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useClientAuth();

  const [book, setBook] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [commentData, setCommentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);

  const [showCartPopup, setShowCartPopup] = useState(false);
  const cartBtnRef = useRef();

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [bookRes, ratingRes, commentRes] = await Promise.all([
        getBookById(bookId),
        getRatingsByBookId(bookId),
        getCommentsByBookId(bookId),
      ]);
      setBook(bookRes?.result ?? null);
      setRatingData(ratingRes?.result ?? null);
      setCommentData(commentRes?.result ?? null);
    } catch {
      setError("Không thể tải thông tin sách.");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── PATCH: Scroll đến #comments khi vào từ link "Viết bình luận" ── */
  useEffect(() => {
    if (window.location.hash === "#comments") {
      const t = setTimeout(() => {
        const el = document.getElementById("comments");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
      return () => clearTimeout(t);
    }
  }, [bookId]);

  const refreshInteractions = useCallback(async () => {
    const [ratingRes, commentRes] = await Promise.all([
      getRatingsByBookId(bookId),
      getCommentsByBookId(bookId),
    ]);
    setRatingData(ratingRes?.result ?? null);
    setCommentData(commentRes?.result ?? null);
  }, [bookId]);

  if (loading) {
    return (
      <div className="bd-loading-wrap client-container">
        <div className="bd-skeleton bd-skeleton-cover" />
        <div style={{ flex: 1, paddingTop: 8 }}>
          {[260, 180, 130, 90, 220].map((w, i) => (
            <div
              key={i}
              className="bd-skeleton"
              style={{ height: 18, width: w, marginBottom: 16 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="bd-error-wrap client-container">
        <FiAlertCircle size={32} style={{ color: "var(--c-danger)" }} />
        <p>{error || "Không tìm thấy sách."}</p>
        <button className="bd-btn-secondary" onClick={() => navigate(-1)}>
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const {
    fiveStar = 0,
    fourStar = 0,
    threeStar = 0,
    twoStar = 0,
    oneStar = 0,
    averageRating = 0,
    totalRatings = 0,
  } = ratingData ?? {};

  return (
    <div className="bd-page client-container">
      {/* Breadcrumb */}
      <nav className="bd-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/books">Sách</Link>
        {book.categoryName && (
          <>
            <span>›</span>
            <Link to={`/books/category/${book.categoryId}`}>
              {book.categoryName}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="bd-breadcrumb-current">{book.title}</span>
      </nav>

      {/* ── Main grid ── */}
      <div className="bd-main-grid">
        {/* Cột trái */}
        <div className="bd-cover-col">
          <div className="bd-cover-wrap">
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="bd-cover-img"
              />
            ) : (
              <div className="bd-cover-placeholder">📚</div>
            )}
            {book.discountPercentage > 0 && (
              <span className="bd-discount-badge">
                -{Math.round(book.discountPercentage)}%
              </span>
            )}
          </div>

          <div className="bd-action-row" style={{ position: "relative" }}>
            <button
              ref={cartBtnRef}
              className="bd-btn-cart"
              disabled={!book.inStock}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/auth/login");
                  return;
                }
                setShowCartPopup((s) => !s);
              }}
              style={
                showCartPopup
                  ? { background: "var(--c-accent)", color: "#fff" }
                  : {}
              }
            >
              <FiShoppingCart size={15} /> Thêm vào giỏ hàng
            </button>
            <button
              className="bd-btn-buy"
              disabled={!book.inStock}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate("/auth/login");
                  return;
                }
                navigate("/checkout", { state: { bookId, quantity: 1 } });
              }}
            >
              <FiZap size={15} /> Mua ngay
            </button>
            {showCartPopup && (
              <AddToCartPopup
                book={book}
                anchorRef={cartBtnRef}
                onClose={() => setShowCartPopup(false)}
              />
            )}
          </div>

          <div
            className="bd-card"
            style={{ padding: "14px 16px", marginBottom: 0 }}
          >
            <div className="bd-policy-item">
              🚚 <span>Giao hàng nhanh, uy tín</span>
            </div>
            <div className="bd-policy-item" style={{ marginTop: 8 }}>
              🔄 <span>Đổi trả miễn phí toàn quốc</span>
            </div>
            <div className="bd-policy-item" style={{ marginTop: 8 }}>
              🔒 <span>Thanh toán an toàn, bảo mật</span>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="bd-info-col">
          <div className="bd-card" style={{ marginBottom: 16 }}>
            <h1 className="bd-title">{book.title}</h1>
            <div className="bd-rating-summary-row">
              <Stars value={averageRating} size={16} />
              <span className="bd-rating-avg">
                {Number(averageRating).toFixed(1)}
              </span>
              <span className="bd-rating-count">({totalRatings} đánh giá)</span>
              {book.purchaseCount > 0 && (
                <span className="bd-sold-count">
                  · Đã bán{" "}
                  {book.purchaseCount > 999
                    ? `${Math.floor(book.purchaseCount / 1000)}k`
                    : book.purchaseCount}
                </span>
              )}
            </div>
            <div className="bd-price-row">
              <span className="bd-final-price">
                {fmtPrice(book.finalPrice ?? book.price)}
              </span>
              {book.discountPercentage > 0 && book.price && (
                <span className="bd-original-price">
                  {fmtPrice(book.price)}
                </span>
              )}
            </div>
            {book.inStock ? (
              <span className="bd-badge-success">✓ Còn hàng</span>
            ) : (
              <span className="bd-badge-danger">✕ Hết hàng</span>
            )}
          </div>

          <div
            className="bd-card"
            style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}
          >
            <div className="bd-detail-title" style={{ padding: "14px 20px" }}>
              Thông tin chi tiết
            </div>
            <InfoRow label="Tác giả" value={book.author} />
            <InfoRow label="Nhà xuất bản" value={book.publisher} />
            <InfoRow label="Nhà cung cấp" value={book.supplier} />
            <InfoRow label="Năm xuất bản" value={book.publishYear} />
            <InfoRow label="Ngôn ngữ" value={book.language} />
            <InfoRow label="Kích thước" value={book.size} />
            <InfoRow
              label="Trọng lượng"
              value={book.weight ? `${book.weight} g` : null}
            />
            <InfoRow label="Số trang" value={book.pageCount} />
            <InfoRow label="Danh mục" value={book.categoryName} />
          </div>

          <div className="bd-card" style={{ marginBottom: 0 }}>
            <h2 className="bd-section-title" style={{ marginBottom: 16 }}>
              Mô tả sách
            </h2>
            <div
              className={`bd-desc-content${descExpanded ? " expanded" : ""}`}
              dangerouslySetInnerHTML={{
                __html: book.description || "<p>Chưa có mô tả.</p>",
              }}
            />
            {book.description && book.description.length > 400 && (
              <button
                className="bd-desc-toggle"
                onClick={() => setDescExpanded((s) => !s)}
              >
                {descExpanded ? (
                  <>
                    <FiChevronUp size={14} /> Thu gọn
                  </>
                ) : (
                  <>
                    <FiChevronDown size={14} /> Xem thêm
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="bd-card">
        <h2 className="bd-section-title">Đánh giá sản phẩm</h2>
        <div className="bd-rating-compact">
          <div className="bd-rating-big">
            <div className="bd-rating-number">
              {Number(averageRating).toFixed(1)}
            </div>
            <Stars value={averageRating} size={22} />
            <div className="bd-rating-total">{totalRatings} đánh giá</div>
          </div>
          <div className="bd-rating-bars">
            <RatingBar stars={5} count={fiveStar} total={totalRatings} />
            <RatingBar stars={4} count={fourStar} total={totalRatings} />
            <RatingBar stars={3} count={threeStar} total={totalRatings} />
            <RatingBar stars={2} count={twoStar} total={totalRatings} />
            <RatingBar stars={1} count={oneStar} total={totalRatings} />
          </div>
        </div>
      </div>

      {/* ── PATCH: Thêm id="comments" để scroll-to ── */}
      <div className="bd-card" id="comments">
        <h2 className="bd-section-title">
          Bình luận ({commentData?.totalComments ?? 0})
        </h2>

        {!isAuthenticated ? (
          <div className="bd-comment-login-prompt">
            <FiAlertCircle size={15} />
            <span>
              <Link to="/auth/login">Đăng nhập</Link> để bình luận.
              <small style={{ marginLeft: 4, color: "var(--c-text-muted)" }}>
                (Yêu cầu đã mua và nhận sách)
              </small>
            </span>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <CommentForm
              bookId={bookId}
              onSuccess={refreshInteractions}
              user={user}
              placeholder="Viết bình luận về cuốn sách này..."
            />
          </div>
        )}

        <div>
          {!commentData?.comments?.length ? (
            <div className="bd-empty-comments">
              <span style={{ fontSize: "2rem" }}>💬</span>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            commentData.comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                bookId={bookId}
                currentUserId={user?.id}
                onMutated={refreshInteractions}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
