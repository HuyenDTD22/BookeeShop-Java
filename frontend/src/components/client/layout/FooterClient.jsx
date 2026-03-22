import React from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";

const FooterClient = () => (
  <footer
    style={{
      background: "#0d1117",
      color: "#8a9ab8",
      borderTop: "1px solid #1c2230",
      marginTop: "auto",
    }}
  >
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 20px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg, #1a6dc4, #2e87e8)",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiBookOpen size={17} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "'Merriweather', serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "#e8ecf3",
              }}
            >
              BookeeShop
            </span>
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.7,
              marginBottom: 20,
              maxWidth: 280,
            }}
          >
            Chuyên cung cấp sách chất lượng cao, đa dạng thể loại. Mang tri thức
            đến gần hơn với mọi người.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { icon: FiFacebook, href: "#" },
              { icon: FiInstagram, href: "#" },
              { icon: FiYoutube, href: "#" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#161b22",
                  border: "1px solid #2a3348",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8a9ab8",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1a6dc4";
                  e.currentTarget.style.color = "#3b9eff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a3348";
                  e.currentTarget.style.color = "#8a9ab8";
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4
            style={{
              color: "#e8ecf3",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Danh mục
          </h4>
          {[
            { label: "Trang chủ", to: "/" },
            { label: "Sách nổi bật", to: "/books/featured" },
            { label: "Sách mới nhất", to: "/books/newest" },
            { label: "Tất cả sách", to: "/books" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: "block",
                fontSize: "0.85rem",
                color: "#8a9ab8",
                marginBottom: 8,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#3b9eff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8a9ab8")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Account */}
        <div>
          <h4
            style={{
              color: "#e8ecf3",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Tài khoản
          </h4>
          {[
            { label: "Đăng nhập", to: "/auth/login" },
            { label: "Đăng ký", to: "/auth/register" },
            { label: "Thông tin cá nhân", to: "/profile" },
            { label: "Đơn hàng của tôi", to: "/orders" },
            { label: "Giỏ hàng", to: "/cart" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: "block",
                fontSize: "0.85rem",
                color: "#8a9ab8",
                marginBottom: 8,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#3b9eff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8a9ab8")}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4
            style={{
              color: "#e8ecf3",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Liên hệ
          </h4>
          {[
            { icon: FiMail, text: "support@bookeeshop.com" },
            { icon: FiPhone, text: "0123 456 789" },
            { icon: FiMapPin, text: "Hà Nội, Việt Nam" },
          ].map(({ icon: Icon, text }, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <Icon
                size={14}
                style={{ color: "#1a6dc4", marginTop: 2, flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.85rem" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid #1c2230",
          marginTop: 40,
          padding: "16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
        }}
      >
        <span>© 2025 BookeeShop. Tất cả quyền được bảo lưu.</span>
        <div style={{ display: "flex", gap: 20 }}>
          {["Chính sách bảo mật", "Điều khoản dịch vụ"].map((t) => (
            <a
              key={t}
              href="#"
              style={{ color: "#8a9ab8", textDecoration: "none" }}
            >
              {t}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default FooterClient;
