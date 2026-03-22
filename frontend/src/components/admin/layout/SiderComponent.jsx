import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiBook,
  FiFolder,
  FiUsers,
  FiUser,
  FiShoppingCart,
  FiBell,
  FiShield,
  FiKey,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/admin/layout.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const NAV_ITEMS = [
  {
    label: "Tổng quan",
    icon: FiGrid,
    path: `/${ADMIN}/`,
    exact: true,
    permission: null,
  },
  {
    label: "Quản lý sách",
    icon: FiBook,
    path: `/${ADMIN}/book`,
    exact: false,
    permission: "BOOK_LIST_VIEW",
  },
  {
    label: "Danh mục",
    icon: FiFolder,
    path: `/${ADMIN}/category`,
    exact: false,
    permission: "CATEGORY_LIST_VIEW",
  },
  {
    label: "Khách hàng",
    icon: FiUsers,
    path: `/${ADMIN}/customer`,
    exact: false,
    permission: "CUSTOMER_LIST_VIEW",
  },
  {
    label: "Đơn hàng",
    icon: FiShoppingCart,
    path: `/${ADMIN}/order`,
    exact: false,
    permission: "ORDER_LIST_VIEW",
  },
  {
    label: "Thông báo",
    icon: FiBell,
    path: `/${ADMIN}/notification`,
    exact: false,
    permission: "NOTIFICATION_LIST_VIEW",
  },
  {
    label: "Nhân sự",
    icon: FiUser,
    path: `/${ADMIN}/staff`,
    exact: false,
    permission: "STAFF_LIST_VIEW",
  },
  {
    label: "Nhóm quyền",
    icon: FiShield,
    path: `/${ADMIN}/role`,
    exact: true,
    permission: "ROLE_LIST_VIEW",
  },
  {
    label: "Phân quyền",
    icon: FiKey,
    path: `/${ADMIN}/role/permissions`,
    exact: false,
    permission: "ROLE_VIEW",
  },
];

const SiderComponent = () => {
  const { hasPermission, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      !item.permission || hasPermission(item.permission) || user?.isAdmin,
  );

  const getRoleItemActive = (path) => {
    if (path !== `/${ADMIN}/role`) return null;
    const current = location.pathname;
    if (current === `/${ADMIN}/role`) return true;
    if (
      current.startsWith(`/${ADMIN}/role/`) &&
      !current.startsWith(`/${ADMIN}/role/permissions`)
    )
      return true;
    return false;
  };

  return (
    <aside className="sidebar" style={{ width: collapsed ? 64 : 260 }}>
      {/* Logo */}
      <div
        className="sidebar-logo"
        style={{ padding: collapsed ? "0 16px" : "0 22px" }}
      >
        <div className="sidebar-logo-icon">
          <FiBookOpen size={17} color="#ffffff" />
        </div>
        {!collapsed && (
          <span className="sidebar-logo-text">
            Bookee<span>Shop</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const customActive = getRoleItemActive(item.path);

          if (customActive !== null) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={() =>
                  `sidebar-nav-link ${customActive ? "active" : "inactive"}`
                }
                style={{
                  padding: collapsed ? "10px 0" : "10px 14px",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? "active" : "inactive"}`
              }
              style={{
                padding: collapsed ? "10px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Mở rộng" : "Thu gọn"}
      >
        {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default SiderComponent;
