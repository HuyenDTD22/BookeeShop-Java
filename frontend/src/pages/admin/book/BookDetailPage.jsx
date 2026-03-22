import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiStar,
  FiBook,
  FiInfo,
  FiMessageSquare,
  FiTrash2,
  FiSend,
  FiUser,
  FiPackage,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiCornerDownRight,
  FiImage,
  FiX,
} from "react-icons/fi";
import {
  getBookById,
  getBookRatings,
  getBookComments,
  replyComment,
  deleteComment,
} from "../../../services/admin/bookService";
import {
  formatCurrency,
  formatDate,
  formatCompact,
} from "../../../utils/format";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Stars ── */
const Stars = ({ value, size = 14 }) => (
  <div className="rating-stars-row">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={size}
        className={s <= Math.round(value) ? "star-filled" : "star-empty"}
        style={{ fill: s <= Math.round(value) ? "#f59e0b" : "transparent" }}
      />
    ))}
  </div>
);

/* ── Rating Bar ── */
const RatingBar = ({ label, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="rating-bar-row">
      <span className="rating-bar-label">{label}★</span>
      <div className="rating-bar-track">
        <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rating-bar-count">{count}</span>
    </div>
  );
};

/* ── Delete Confirm Modal ── */
const DeleteModal = ({ onConfirm, onCancel, loading }) => (
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
        maxWidth: 380,
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
            width: 38,
            height: 38,
            background: "var(--danger-bg)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--danger)",
          }}
        >
          <FiTrash2 size={17} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "0.95rem",
            fontFamily: "'Merriweather', serif",
          }}
        >
          Xác nhận xóa bình luận
        </h3>
      </div>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          marginBottom: 20,
          lineHeight: 1.6,
        }}
      >
        Bình luận này sẽ bị ẩn khỏi hệ thống. Hành động không thể hoàn tác.
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
              style={{ width: 13, height: 13, borderWidth: 2 }}
            />
          ) : (
            <FiTrash2 size={13} />
          )}
          Xóa
        </button>
      </div>
    </div>
  </div>
);

/* ── Comment Item (recursive) ── */
const CommentItem = ({
  comment,
  parentUsername = null,
  onReplySuccess,
  onDeleteSuccess,
  depth = 0,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [replyPreview, setReplyPreview] = useState("");
  const [replying, setReplying] = useState(false);
  const [showChildren, setShowChildren] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const imageInputRef = useRef();

  const displayName = comment.user?.username ?? "Admin";
  const isDeleted = Boolean(comment.deleted);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplying(true);
      await replyComment(comment.id, {
        content: replyText.trim(),
        thumbnail: replyImage,
      });
      setReplyText("");
      setReplyImage(null);
      setReplyPreview("");
      setShowReply(false);
      onReplySuccess?.();
    } catch {
      /* ignore */
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteComment(comment.id);
      setDeleteModal(false);
      onDeleteSuccess?.();
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReplyImage(file);
    setReplyPreview(URL.createObjectURL(file));
  };

  // Count all descendants
  const countDescendants = (c) => {
    let count = c.children?.length ?? 0;
    c.children?.forEach((child) => {
      count += countDescendants(child);
    });
    return count;
  };

  return (
    <div style={{ marginBottom: depth === 0 ? 14 : 10 }}>
      {deleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(false)}
          loading={deleting}
        />
      )}

      <div className={depth > 0 ? "reply-item" : "comment-item"}>
        {/* ── "Đang trả lời" indicator ── */}
        {depth > 0 && parentUsername && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            <FiCornerDownRight size={12} style={{ color: "var(--accent)" }} />
            Đang trả lời{" "}
            <strong style={{ color: "var(--accent)", fontWeight: 600 }}>
              @{parentUsername}
            </strong>
          </div>
        )}

        {/* Header */}
        <div className="comment-user">
          <div
            className="comment-avatar"
            style={!comment.user ? { background: "var(--accent)" } : {}}
          >
            {displayName[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="comment-username">{displayName}</span>
              {!comment.user && <span className="admin-badge">Admin</span>}
            </div>
            <span className="comment-time">
              {formatDate(comment.createdAt, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Content */}
        {isDeleted ? (
          <p className="comment-content">
            <em style={{ color: "var(--text-muted)" }}>
              [Bình luận đã bị xóa]
            </em>
          </p>
        ) : (
          <>
            <p className="comment-content">{comment.content}</p>
            {comment.thumbnail && (
              <img
                src={comment.thumbnail}
                alt=""
                style={{
                  maxWidth: 200,
                  borderRadius: "var(--radius-sm)",
                  marginBottom: 8,
                }}
              />
            )}
          </>
        )}

        {/* Actions */}
        {!isDeleted && (
          <div className="comment-actions">
            {depth === 0 && (
              <button
                className="btn-secondary-admin"
                style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                onClick={() => setShowReply((s) => !s)}
              >
                <FiMessageSquare size={12} />
                {showReply ? "Hủy trả lời" : "Trả lời"}
              </button>
            )}
            <button
              className="btn-danger-admin"
              style={{ padding: "4px 12px", fontSize: "0.78rem" }}
              onClick={() => setDeleteModal(true)}
            >
              <FiTrash2 size={12} /> Xóa
            </button>
          </div>
        )}

        {/* Reply box */}
        {showReply && (
          <div className="reply-box animate-fadeIn" style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginBottom: 8,
              }}
            >
              <FiCornerDownRight size={12} style={{ color: "var(--accent)" }} />
              Đang trả lời{" "}
              <strong style={{ color: "var(--accent)" }}>@{displayName}</strong>
            </div>
            <textarea
              className="reply-textarea"
              placeholder="Nhập nội dung phản hồi... (Ctrl+Enter để gửi)"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleReply();
              }}
            />
            {/* Image preview */}
            {replyPreview && (
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: 10,
                }}
              >
                <img
                  src={replyPreview}
                  alt=""
                  style={{
                    maxWidth: 160,
                    maxHeight: 120,
                    borderRadius: "var(--radius-sm)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setReplyImage(null);
                    setReplyPreview("");
                  }}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "var(--danger)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiX size={11} />
                </button>
              </div>
            )}
            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => imageInputRef.current?.click()}
                  title="Đính kèm ảnh"
                  style={{ width: 30, height: 30 }}
                >
                  <FiImage size={13} />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImagePick}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-secondary-admin"
                  style={{ padding: "5px 14px", fontSize: "0.82rem" }}
                  onClick={() => {
                    setShowReply(false);
                    setReplyText("");
                    setReplyImage(null);
                    setReplyPreview("");
                  }}
                >
                  Hủy
                </button>
                <button
                  className="btn-primary-admin"
                  style={{ padding: "5px 14px", fontSize: "0.82rem" }}
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                >
                  {replying ? (
                    <div
                      className="spinner"
                      style={{ width: 13, height: 13, borderWidth: 2 }}
                    />
                  ) : (
                    <FiSend size={12} />
                  )}
                  Gửi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Children replies ── */}
      {comment.children?.length > 0 && (
        <div className="comment-replies">
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--accent)",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 10,
              fontWeight: 500,
            }}
            onClick={() => setShowChildren((s) => !s)}
          >
            {showChildren ? (
              <FiChevronUp size={12} />
            ) : (
              <FiChevronDown size={12} />
            )}
            {showChildren ? "Ẩn" : "Xem"} {countDescendants(comment)} phản hồi
          </button>
          {showChildren &&
            comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                parentUsername={displayName} // truyền username của comment cha
                onReplySuccess={onReplySuccess}
                onDeleteSuccess={onDeleteSuccess}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};

/* ── Count all comments including children ── */
const countAllComments = (comments = []) => {
  let total = 0;
  const count = (list) => {
    for (const c of list) {
      if (!c.deleted) total++;
      if (c.children?.length) count(c.children);
    }
  };
  count(comments);
  return total;
};

/* ══════════════════════════════════════════
   BookDetailPage
═══════════════════════════════════════════ */
const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, ratingsRes, commentsRes] = await Promise.all([
        getBookById(id),
        getBookRatings(id),
        getBookComments(id),
      ]);
      setBook(bookRes.result);
      setRatings(ratingsRes.result);
      setComments(commentsRes.result);
    } catch {
      setError("Không thể tải thông tin sách.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}
      >
        {[340, 500].map((h, i) => (
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

  if (error || !book) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy sách"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/book`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const totalRatings = ratings?.totalRatings ?? 0;
  const totalComments = countAllComments(comments?.comments ?? []);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/book`}>Quản lý sách</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>{book.title}</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.3rem" }}>
            {book.title}
          </h1>
          <p className="page-subtitle">{book.categoryName}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/book`)}
          >
            <FiArrowLeft size={14} /> Quay lại
          </button>
          <Link to={`/${ADMIN}/book/edit/${book.id}`}>
            <button className="btn-primary-admin">
              <FiEdit2 size={14} /> Chỉnh sửa
            </button>
          </Link>
        </div>
      </div>

      <div className="book-detail-layout">
        {/* ── Left: Cover + Quick Stats ── */}
        <div>
          <div className="book-cover-wrap">
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="book-cover-img"
              />
            ) : (
              <div className="book-cover-placeholder">
                <FiPackage size={40} style={{ opacity: 0.25 }} />
                <span>Chưa có ảnh</span>
              </div>
            )}

            {/* Price */}
            <div style={{ marginTop: 14, textAlign: "left" }}>
              <div className="price-display">
                {formatCurrency(book.finalPrice ?? book.price)}
              </div>
              {book.discountPercentage > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <span className="original-price">
                    {formatCurrency(book.price)}
                  </span>
                  <span className="badge-admin badge-danger">
                    -{book.discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Quick stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 16,
              }}
            >
              {[
                { label: "Tồn kho", value: book.stock ?? 0 },
                { label: "Đã bán", value: formatCompact(book.totalSold ?? 0) },
                {
                  label: "Rating",
                  value: book.averageRating
                    ? `${Number(book.averageRating).toFixed(1)} ★`
                    : "—",
                },
                { label: "Đánh giá", value: totalRatings },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginTop: 4,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              {book.feature ? (
                <span
                  className="badge-admin badge-info"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: 8,
                  }}
                >
                  ⭐ Sách nổi bật
                </span>
              ) : (
                <span
                  className="badge-admin badge-muted"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: 8,
                  }}
                >
                  Sách thường
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Detail sections ── */}
        <div>
          {/* Basic info */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiInfo size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin cơ bản</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                {[
                  { label: "Tác giả", value: book.author },
                  { label: "Nhà xuất bản", value: book.publisher },
                  { label: "Nhà cung cấp", value: book.supplier },
                  { label: "Năm xuất bản", value: book.publishYear },
                  { label: "Ngôn ngữ", value: book.language },
                  { label: "Kích thước", value: book.size },
                  {
                    label: "Trọng lượng",
                    value: book.weight ? `${book.weight}g` : "—",
                  },
                  { label: "Số trang", value: book.pageCount },
                  { label: "Danh mục", value: book.categoryName },
                  { label: "Ngày tạo", value: formatDate(book.createdAt) },
                ].map(({ label, value }) => (
                  <div className="info-item" key={label}>
                    <label>{label}</label>
                    <div className="info-value">{value ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiBook size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Mô tả sách</h3>
            </div>
            <div className="detail-section-body">
              {book.description ? (
                <div
                  dangerouslySetInnerHTML={{ __html: book.description }}
                  style={{
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                  }}
                />
              ) : (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Chưa có mô tả
                </p>
              )}
            </div>
          </div>

          {/* Ratings */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiStar size={15} style={{ color: "#f59e0b" }} />
              <h3 className="detail-section-title">Đánh giá & Xếp hạng</h3>
            </div>
            <div className="detail-section-body">
              {totalRatings === 0 ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Chưa có đánh giá nào
                </p>
              ) : (
                <div className="rating-summary">
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div className="rating-big-number">
                      {Number(ratings.averageRating).toFixed(1)}
                    </div>
                    <Stars value={ratings.averageRating} size={16} />
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        marginTop: 6,
                      }}
                    >
                      {totalRatings} đánh giá
                    </div>
                  </div>
                  <div className="rating-bars">
                    {[
                      { label: 5, count: ratings.fiveStar },
                      { label: 4, count: ratings.fourStar },
                      { label: 3, count: ratings.threeStar },
                      { label: 2, count: ratings.twoStar },
                      { label: 1, count: ratings.oneStar },
                    ].map(({ label, count }) => (
                      <RatingBar
                        key={label}
                        label={label}
                        count={count}
                        total={totalRatings}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments — totalComments tính cả replies */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiMessageSquare size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">
                Bình luận ({totalComments})
              </h3>
            </div>
            <div className="detail-section-body">
              {!comments?.comments?.length ? (
                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                  Chưa có bình luận nào
                </p>
              ) : (
                comments.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    parentUsername={null}
                    onReplySuccess={fetchAll}
                    onDeleteSuccess={fetchAll}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
