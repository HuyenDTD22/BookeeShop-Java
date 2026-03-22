package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardAnalyticsResponse {

    // Biểu đồ doanh thu theo ngày (30 ngày gần nhất)
    List<RevenueDataPoint> dailyRevenue;

    // Biểu đồ doanh thu theo tháng (12 tháng gần nhất)
    List<RevenueDataPoint> monthlyRevenue;

    // Biểu đồ doanh thu theo năm (5 năm gần nhất)
    List<RevenueDataPoint> yearlyRevenue;

    // Top 10 sách bán chạy
    List<TopBookResponse> topSellingBooks;

    // Top 5 khách hàng mua nhiều nhất
    List<TopCustomerResponse> topCustomers;

    // Cảnh báo chi tiết
    List<LowStockBookResponse> lowStockBooks;   // sách sắp hết hàng (stock <= threshold)
}