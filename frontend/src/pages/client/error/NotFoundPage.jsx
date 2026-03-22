import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome, FiSearch } from "react-icons/fi";
import "../../../styles/client/error-pages.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="ep-page">
      <div className="ep-card">
        {/* Illustration */}
        <div className="ep-illustration">
          <div className="ep-circle ep-circle-1" />
          <div className="ep-circle ep-circle-2" />
          <div className="ep-number">404</div>
          <div className="ep-book-stack">📚</div>
        </div>

        <h1 className="ep-title">Trang không tìm thấy</h1>
        <p className="ep-sub">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          <br />
          Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ nhé!
        </p>

        <div className="ep-actions">
          <button className="ep-btn-back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={15} /> Quay lại
          </button>
          <Link to="/" className="ep-btn-home">
            <FiHome size={15} /> Về trang chủ
          </Link>
          <Link to="/books" className="ep-btn-browse">
            <FiSearch size={15} /> Khám phá sách
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
