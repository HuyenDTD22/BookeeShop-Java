import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ClientPagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages - 1, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="cl-pagination">
      <button
        className="cl-page-btn"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
      >
        <FiChevronLeft size={14} />
      </button>
      {start > 0 && (
        <>
          <button className="cl-page-btn" onClick={() => onChange(0)}>
            1
          </button>
          {start > 1 && (
            <span style={{ color: "var(--c-text-muted)", padding: "0 4px" }}>
              …
            </span>
          )}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={`cl-page-btn ${p === page ? "active" : ""}`}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}
      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && (
            <span style={{ color: "var(--c-text-muted)", padding: "0 4px" }}>
              …
            </span>
          )}
          <button
            className="cl-page-btn"
            onClick={() => onChange(totalPages - 1)}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        className="cl-page-btn"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
      >
        <FiChevronRight size={14} />
      </button>
    </div>
  );
};

export default ClientPagination;
