import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiStar,
  FiMessageSquare,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import {
  createRating,
  getRatingsByBookId,
} from "../../../services/client/clientBookService";
import { useClientAuth } from "../../../contexts/ClientAuthContext";

const StarSelector = ({ value, onChange, disabled }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(s)}
        style={{
          background: "none",
          border: "none",
          cursor: disabled ? "default" : "pointer",
          padding: 2,
          lineHeight: 1,
          transition: "transform 0.1s",
        }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.transform = "scale(1.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <FiStar
          size={20}
          fill={s <= value ? "#f59e0b" : "transparent"}
          color={s <= value ? "#f59e0b" : "#cbd5e1"}
        />
      </button>
    ))}
  </div>
);

const STAR_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

/* ── ItemRatingRow ── */
const ItemRatingRow = ({ item, currentUsername }) => {
  const [st, setSt] = useState({
    loading: true,
    existingValue: null,
    selectedValue: 0,
    submitting: false,
    done: false,
    error: "",
  });

  const thumbnail = item.thumbnail ?? item.bookThumbnail;

  useEffect(() => {
    // bookId phải là UUID hợp lệ
    if (!item.bookId || !currentUsername) {
      setSt((s) => ({ ...s, loading: false }));
      return;
    }

    // Validate UUID format trước khi gọi API
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(item.bookId)) {
      setSt((s) => ({ ...s, loading: false }));
      return;
    }

    getRatingsByBookId(item.bookId)
      .then((res) => {
        const ratings = res?.result?.ratings ?? [];
        // So sánh bằng userUsername (email) vì JWT không có userId
        const mine = ratings.find((r) => r.userUsername === currentUsername);
        setSt((s) => ({
          ...s,
          loading: false,
          existingValue: mine ? mine.value : null,
          done: !!mine,
          selectedValue: mine ? mine.value : 0,
        }));
      })
      .catch(() => setSt((s) => ({ ...s, loading: false })));
  }, [item.bookId, currentUsername]);

  const handleSubmit = async () => {
    if (st.selectedValue === 0) {
      setSt((s) => ({ ...s, error: "Vui lòng chọn số sao." }));
      return;
    }
    try {
      setSt((s) => ({ ...s, submitting: true, error: "" }));
      await createRating(item.bookId, st.selectedValue);
      setSt((s) => ({
        ...s,
        submitting: false,
        done: true,
        existingValue: s.selectedValue,
      }));
    } catch (err) {
      const code = err?.response?.data?.code;
      if (code === 1046) {
        // Đã đánh giá — reload để lấy giá trị
        getRatingsByBookId(item.bookId)
          .then((res) => {
            const ratings = res?.result?.ratings ?? [];
            const mine = ratings.find(
              (r) => r.userUsername === currentUsername,
            );
            if (mine)
              setSt((s) => ({
                ...s,
                submitting: false,
                done: true,
                existingValue: mine.value,
                selectedValue: mine.value,
                error: "",
              }));
          })
          .catch(() => {});
        return;
      }
      let msg = "Đánh giá thất bại. Vui lòng thử lại.";
      if (code === 1047) msg = "Bạn cần mua và nhận sách trước khi đánh giá.";
      setSt((s) => ({ ...s, submitting: false, error: msg }));
    }
  };

  const displayValue = st.done
    ? (st.existingValue ?? st.selectedValue)
    : st.selectedValue;

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        padding: "14px 16px",
        background: "#fff",
        border: `1px solid ${st.done ? "rgba(16,185,129,0.3)" : "var(--c-border)"}`,
        borderRadius: "var(--radius-md)",
        transition: "border-color 0.2s",
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={item.title}
          style={{
            width: 52,
            height: 66,
            objectFit: "cover",
            borderRadius: 6,
            border: "1px solid var(--c-border)",
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 52,
            height: 66,
            background: "var(--c-raised)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
        >
          📚
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--c-text)",
            marginBottom: 10,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>

        {st.loading ? (
          <div style={{ fontSize: "0.78rem", color: "var(--c-text-muted)" }}>
            Đang tải...
          </div>
        ) : st.done ? (
          /* Đã đánh giá */
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    size={17}
                    fill={s <= displayValue ? "#f59e0b" : "transparent"}
                    color={s <= displayValue ? "#f59e0b" : "#cbd5e1"}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "#059669",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <FiCheck size={12} />
                {STAR_LABELS[Math.round(displayValue)] || "Đã đánh giá"}
              </span>
            </div>
            <Link
              to={`/books/${item.bookId}#comments`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                background: "var(--c-accent-bg)",
                color: "var(--c-accent)",
                border: "1px solid var(--c-accent)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.78rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--c-accent)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--c-accent-bg)";
                e.currentTarget.style.color = "var(--c-accent)";
              }}
            >
              <FiMessageSquare size={13} /> Viết bình luận
            </Link>
          </div>
        ) : (
          /* Chưa đánh giá */
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <StarSelector
                value={st.selectedValue}
                onChange={(v) =>
                  setSt((s) => ({ ...s, selectedValue: v, error: "" }))
                }
                disabled={st.submitting}
              />
              {st.selectedValue > 0 && (
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#92400e",
                    fontWeight: 500,
                  }}
                >
                  {STAR_LABELS[st.selectedValue]}
                </span>
              )}
            </div>
            {st.error && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--c-danger)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  margin: "0 0 6px",
                }}
              >
                <FiAlertCircle size={11} /> {st.error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={st.submitting || st.selectedValue === 0}
              style={{
                padding: "6px 16px",
                background:
                  st.selectedValue === 0 ? "var(--c-raised)" : "#f59e0b",
                color: st.selectedValue === 0 ? "var(--c-text-muted)" : "#fff",
                border: `1px solid ${st.selectedValue === 0 ? "var(--c-border)" : "#f59e0b"}`,
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor:
                  st.selectedValue === 0 || st.submitting
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              {st.submitting ? (
                <>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />{" "}
                  Đang gửi...
                </>
              ) : (
                <>
                  <FiStar
                    size={12}
                    fill={st.selectedValue > 0 ? "#fff" : "transparent"}
                  />
                  Gửi đánh giá
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   RatingPanel
═══════════════════════════════════════════ */
const RatingPanel = ({ order }) => {
  const { user } = useClientAuth();
  const items = order.orderItems ?? [];
  if (!items.length) return null;

  // username = email từ JWT payload.sub
  const currentUsername = user?.username;

  return (
    <div
      style={{
        borderTop: "1px solid var(--c-border)",
        padding: "18px 20px",
        background: "linear-gradient(to bottom, #fffbf0, #fff)",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "#92400e",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FiStar size={14} fill="#f59e0b" color="#f59e0b" />
        Đánh giá sản phẩm
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <ItemRatingRow
            key={item.id}
            item={item}
            currentUsername={currentUsername}
          />
        ))}
      </div>

      <p
        style={{
          fontSize: "0.72rem",
          color: "var(--c-text-muted)",
          marginTop: 12,
          marginBottom: 0,
        }}
      >
        💡 Sau khi đánh giá sao, bạn có thể viết bình luận chi tiết trên trang
        sách.
      </p>
    </div>
  );
};

export default RatingPanel;
