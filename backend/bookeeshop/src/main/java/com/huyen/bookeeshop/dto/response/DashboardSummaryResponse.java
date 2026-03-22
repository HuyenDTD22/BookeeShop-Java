package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardSummaryResponse {

    // Khách hàng
    Long totalCustomers;
    Long newCustomersToday;
    Long newCustomersThisMonth;

    // Nhân viên
    Long totalStaff;

    // Đơn hàng
    Long totalOrders;
    Long totalOrdersToday;
    OrderStatusSummary ordersByStatus;

    // Doanh thu
    Double totalRevenue;
    Double revenueToday;
    Double revenueYesterday;
    Double revenueTodayChangePercent;       // % so với hôm qua

    Double revenueThisMonth;
    Double revenueLastMonth;
    Double revenueMonthChangePercent;       // % so với tháng trước

    // Sách
    Long totalBooks;
    Long lowStockBooksCount;                // số sách sắp hết hàng

    // Cảnh báo nhanh
    Boolean revenueDropAlert;               // true nếu doanh thu hôm nay giảm > 20% so với hôm qua
}