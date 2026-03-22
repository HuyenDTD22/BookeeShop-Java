import React from "react";
import { Link } from "react-router-dom";
import { FiGrid, FiArrowRight } from "react-icons/fi";

const CategoryCard = ({ category }) => (
  <div
    className="cl-cat-card"
    style={{ display: "flex", flexDirection: "column" }}
  >
    <Link
      to={`/books/category/${category.id}`}
      style={{ textDecoration: "none", display: "block", flex: 1 }}
    >
      {category.thumbnail ? (
        <img
          src={category.thumbnail}
          alt={category.name}
          className="cl-cat-card-img"
          loading="lazy"
        />
      ) : (
        <div className="cl-cat-card-img-placeholder">
          <FiGrid size={28} color="var(--c-accent)" />
        </div>
      )}
      <div className="cl-cat-card-name">{category.name}</div>
    </Link>

    {/* Nút xem thêm */}
    <Link
      to={`/books/category/${category.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "7px 10px",
        borderTop: "1px solid var(--c-border)",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--c-accent)",
        textDecoration: "none",
        background: "var(--c-raised)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--c-accent-bg)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "var(--c-raised)")
      }
    >
      Xem thêm <FiArrowRight size={12} />
    </Link>
  </div>
);

export default CategoryCard;
