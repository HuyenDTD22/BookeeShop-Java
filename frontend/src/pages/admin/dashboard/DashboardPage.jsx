import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiBook,
  FiShoppingCart,
  FiDollarSign,
  FiAlertTriangle,
  FiRefreshCw,
  FiPackage,
  FiUserCheck,
  FiArrowUpRight,
} from "react-icons/fi";
import dashboardService from "../../../services/admin/dashboardService";
import {
  formatCurrency,
  formatCompact,
  formatDate,
} from "../../../utils/format";
import "../../../styles/admin/dashboard.css";

/* ── Custom Recharts Tooltip ── */
const CustomTooltip = ({ active, payload, label, isCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: "0.82rem",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color, fontWeight: 600, margin: 0 }}>
          {isCurrency
            ? formatCurrency(entry.value)
            : formatCompact(entry.value)}
        </p>
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  iconBg,
  delay = 0,
}) => (
  <div
    className="stat-card animate-fadeIn"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <div
        className="stat-icon"
        style={{ background: iconBg || "var(--bg-raised)" }}
      >
        <Icon size={20} />
      </div>
      {change != null && (
        <span className={`stat-change ${change >= 0 ? "up" : "down"}`}>
          {change >= 0 ? (
            <FiTrendingUp size={13} />
          ) : (
            <FiTrendingDown size={13} />
          )}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {changeLabel && (
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: 6,
        }}
      >
        {changeLabel}
      </div>
    )}
  </div>
);

/* ── Empty State ── */
const EmptyState = ({ message }) => (
  <div className="empty-state">
    <FiArrowUpRight size={28} style={{ opacity: 0.3 }} />
    {message}
  </div>
);

/* ── Constants ── */
const PIE_COLORS = {
  pending: "#f59e0b",
  confirmed: "#60a5fa",
  shipping: "#a78bfa",
  completed: "#2dd4a7",
  cancelled: "#f16060",
};
const ORDER_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
const PERIODS = [
  { key: "daily", label: "30 ngày" },
  { key: "monthly", label: "12 tháng" },
  { key: "yearly", label: "5 năm" },
];

/* ══════════════════════════════════════════
   Main DashboardPage
═══════════════════════════════════════════ */
const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("daily");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      const [sumRes, anaRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getAnalytics(),
      ]);
      setSummary(sumRes.result);
      setAnalytics(anaRes.result);
    } catch {
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Revenue chart data */
  const revenueData = analytics
    ? (period === "daily"
        ? analytics.dailyRevenue
        : period === "monthly"
          ? analytics.monthlyRevenue
          : analytics.yearlyRevenue
      )?.map((d) => ({
        label: d.label,
        revenue: d.revenue,
        orders: d.orderCount,
      }))
    : [];

  /* Pie data */
  const pieData = summary?.ordersByStatus
    ? Object.entries(summary.ordersByStatus)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({
          name: ORDER_LABELS[key] || key,
          value,
          color: PIE_COLORS[key] || "#8b9bb4",
        }))
    : [];

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div>
        <div className="skeleton-kpi-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-kpi-card">
              <div className="skeleton" style={{ height: "100%" }} />
            </div>
          ))}
        </div>
        <div className="skeleton-chart-grid">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton-chart-card">
              <div className="skeleton" style={{ height: "100%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tổng quan</h1>
          <p className="page-subtitle">
            Cập nhật lần cuối:{" "}
            {formatDate(new Date(), {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <FiRefreshCw
            size={14}
            style={{
              animation: refreshing ? "spin 0.7s linear infinite" : "none",
            }}
          />
          Làm mới
        </button>
      </div>

      {error && (
        <div
          className="alert-admin alert-danger-admin animate-fadeIn"
          style={{ marginBottom: 24 }}
        >
          <FiAlertTriangle size={16} />
          {error}
        </div>
      )}

      {summary?.revenueDropAlert && (
        <div
          className="alert-admin alert-warning-admin animate-fadeIn"
          style={{ marginBottom: 24 }}
        >
          <FiAlertTriangle size={16} />
          Cảnh báo: Doanh thu hôm nay giảm hơn 20% so với hôm qua.
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">
        <StatCard
          icon={FiDollarSign}
          label="Doanh thu hôm nay"
          value={formatCurrency(summary?.revenueToday)}
          change={summary?.revenueTodayChangePercent}
          changeLabel="so với hôm qua"
          iconBg="rgba(240,165,0,0.15)"
          delay={0}
        />
        <StatCard
          icon={FiTrendingUp}
          label="Doanh thu tháng này"
          value={formatCurrency(summary?.revenueThisMonth)}
          change={summary?.revenueMonthChangePercent}
          changeLabel="so với tháng trước"
          iconBg="rgba(45,212,167,0.12)"
          delay={60}
        />
        <StatCard
          icon={FiShoppingCart}
          label="Đơn hàng hôm nay"
          value={formatCompact(summary?.totalOrdersToday)}
          changeLabel={`Tổng: ${formatCompact(summary?.totalOrders)} đơn`}
          iconBg="rgba(96,165,250,0.12)"
          delay={120}
        />
        <StatCard
          icon={FiUsers}
          label="Khách hàng mới hôm nay"
          value={formatCompact(summary?.newCustomersToday)}
          changeLabel={`Tháng này: +${formatCompact(summary?.newCustomersThisMonth)}`}
          iconBg="rgba(167,139,250,0.12)"
          delay={180}
        />
        <StatCard
          icon={FiBook}
          label="Tổng sách"
          value={formatCompact(summary?.totalBooks)}
          changeLabel={
            summary?.lowStockBooksCount > 0
              ? `⚠ ${summary.lowStockBooksCount} sách sắp hết`
              : "Kho hàng ổn định"
          }
          iconBg="rgba(240,165,0,0.1)"
          delay={240}
        />
        <StatCard
          icon={FiUserCheck}
          label="Nhân viên"
          value={formatCompact(summary?.totalStaff)}
          changeLabel={`Tổng KH: ${formatCompact(summary?.totalCustomers)}`}
          iconBg="rgba(45,212,167,0.1)"
          delay={300}
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="chart-row-1">
        {/* Revenue area chart */}
        <div className="admin-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Doanh thu</h3>
              <p className="chart-card-subtitle">
                Tổng cộng: {formatCurrency(summary?.totalRevenue)}
              </p>
            </div>
            <div className="period-btns">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`period-btn ${period === p.key ? "active" : "inactive"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={revenueData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f0a500" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f0a500" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatCompact(v)}
              />
              <Tooltip content={<CustomTooltip isCurrency />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f0a500"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#f0a500",
                  stroke: "var(--bg-surface)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="admin-card">
          <h3 className="chart-card-title">Trạng thái đơn hàng</h3>
          <p className="chart-card-subtitle" style={{ marginBottom: 16 }}>
            Phân bố hiện tại
          </p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCompact(value) + " đơn",
                    name,
                  ]}
                  contentStyle={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="pie-empty">Chưa có dữ liệu đơn hàng</div>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="chart-row-2">
        {/* Top selling books */}
        <div className="admin-card">
          <h3 className="chart-card-title">Top sách bán chạy</h3>
          <p className="chart-card-subtitle" style={{ marginBottom: 16 }}>
            10 cuốn bán nhiều nhất
          </p>
          {analytics?.topSellingBooks?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={analytics.topSellingBooks.slice(0, 6).map((b) => ({
                  name:
                    b.title.length > 14 ? b.title.slice(0, 14) + "…" : b.title,
                  sold: b.totalSold,
                }))}
                layout="vertical"
                margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [v + " cuốn", "Đã bán"]}
                  contentStyle={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                  }}
                />
                <Bar dataKey="sold" fill="#f0a500" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Chưa có dữ liệu bán hàng" />
          )}
        </div>

        {/* Top customers */}
        <div className="admin-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Khách hàng VIP</h3>
              <p className="chart-card-subtitle">Top 5 mua nhiều nhất</p>
            </div>
          </div>
          {analytics?.topCustomers?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {analytics.topCustomers.map((c, i) => (
                <div key={i} className="top-customer-item">
                  <div
                    className={`top-customer-rank ${i === 0 ? "first" : "other"}`}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="top-customer-name">
                      {c.fullName || c.username}
                    </div>
                    <div className="top-customer-orders">
                      {c.totalOrders} đơn hàng
                    </div>
                  </div>
                  <div className="top-customer-spent">
                    {formatCurrency(c.totalSpent)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Chưa có dữ liệu khách hàng" />
          )}
        </div>
      </div>

      {/* ── Low Stock Alert ── */}
      {analytics?.lowStockBooks?.length > 0 && (
        <div className="admin-card animate-fadeIn">
          <div className="low-stock-header">
            <div className="low-stock-icon">
              <FiAlertTriangle size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                Cảnh báo tồn kho thấp
              </h3>
              <p className="chart-card-subtitle">
                {analytics.lowStockBooks.length} sách có tồn kho ≤ 10
              </p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th style={{ textAlign: "right" }}>Tồn kho</th>
                  <th style={{ textAlign: "right" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {analytics.lowStockBooks.map((book, i) => (
                  <tr key={i}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt=""
                            className="book-thumbnail"
                          />
                        ) : (
                          <div className="book-thumbnail-placeholder">
                            <FiPackage size={14} color="var(--text-muted)" />
                          </div>
                        )}
                        <span style={{ fontWeight: 500 }}>{book.title}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      <span
                        style={{
                          color:
                            book.stock <= 3
                              ? "var(--danger)"
                              : "var(--warning)",
                        }}
                      >
                        {book.stock}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        className={`badge-admin ${book.stock <= 3 ? "badge-danger" : "badge-warning"}`}
                      >
                        {book.stock <= 3 ? "Gần hết" : "Sắp hết"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
