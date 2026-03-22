import React, { useState, useEffect } from "react";
import SiderComponent from "./SiderComponent";
import HeaderComponent from "./HeaderComponent";
import "../../../styles/admin/layout.css";

const AdminLayoutComponent = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState(260);

  useEffect(() => {
    const aside = document.querySelector("aside.sidebar");
    if (!aside) return;
    const observer = new ResizeObserver(([entry]) => {
      setSidebarWidth(entry.contentRect.width);
    });
    observer.observe(aside);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="admin-layout">
      <SiderComponent />
      <HeaderComponent sidebarWidth={sidebarWidth} />
      <main
        className="admin-layout-main"
        style={{ marginLeft: sidebarWidth, paddingTop: 64 }}
      >
        <div className="admin-layout-content animate-fadeIn">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayoutComponent;
