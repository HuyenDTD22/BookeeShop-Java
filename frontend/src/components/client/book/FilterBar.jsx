import React from "react";
import { FiRefreshCw } from "react-icons/fi";

const FilterBar = ({ params, onChange }) => {
  const update = (key, val) => onChange({ ...params, [key]: val, page: 0 });

  const sortValue =
    params.sortBy && params.sortDir ? `${params.sortBy}_${params.sortDir}` : "";

  const handleSort = (e) => {
    const v = e.target.value;
    if (!v) {
      onChange({ ...params, sortBy: "createdAt", sortDir: "desc", page: 0 });
      return;
    }
    const [sortBy, sortDir] = v.split("_");
    onChange({ ...params, sortBy, sortDir, page: 0 });
  };

  return (
    <div className="cl-filter-bar">
      <span className="cl-filter-label">Lọc &amp; Sắp xếp:</span>

      <select
        className="cl-filter-select"
        value={sortValue}
        onChange={handleSort}
      >
        <option value="">Mới nhất</option>
        <option value="price_asc">Giá: Thấp → Cao</option>
        <option value="price_desc">Giá: Cao → Thấp</option>
        <option value="purchaseCount_desc">Bán chạy</option>
        <option value="rating_desc">Đánh giá cao</option>
        <option value="title_asc">Tên A→Z</option>
      </select>

      <select
        className="cl-filter-select"
        value={params.minRating ?? ""}
        onChange={(e) => update("minRating", e.target.value || undefined)}
      >
        <option value="">Tất cả sao</option>
        <option value="5">5 ★</option>
        <option value="4">4 ★ trở lên</option>
        <option value="3">3 ★ trở lên</option>
      </select>

      <button
        className="cl-filter-reset"
        onClick={() =>
          onChange({
            page: 0,
            size: params.size ?? 20,
            sortBy: "createdAt",
            sortDir: "desc",
          })
        }
      >
        <FiRefreshCw size={13} style={{ marginRight: 4 }} />
        Đặt lại
      </button>
    </div>
  );
};

export default FilterBar;
