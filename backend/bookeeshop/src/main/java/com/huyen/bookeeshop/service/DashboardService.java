package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.response.*;
import com.huyen.bookeeshop.mapper.DashboardMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import com.huyen.bookeeshop.repository.DashboardRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardService {

    // Low stock threshold
    static final int LOW_STOCK_THRESHOLD = 10;

    // Revenue decrease alert threshold (%)
    static final double REVENUE_DROP_ALERT_THRESHOLD = 20.0;

    // Number of top records
    static final int TOP_BOOKS_LIMIT     = 10;
    static final int TOP_CUSTOMERS_LIMIT = 5;

    DashboardRepository dashboardRepository;
    UserRepository userRepository;
    BookRepository bookRepository;
    DashboardMapper dashboardMapper;

    /**
     * 1. ADMIN - Get dashboard summary data (key metrics)
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime yesterdayStart = todayStart.minusDays(1);
        LocalDateTime yesterdayEnd = todayStart.minusNanos(1);
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime lastMonthStart = monthStart.minusMonths(1);
        LocalDateTime lastMonthEnd = monthStart.minusNanos(1);

        // Customer
        Long totalCustomers = userRepository.countTotalCustomers();
        Long newCustomersToday = userRepository.countNewCustomersBetween(todayStart, todayEnd);
        Long newCustomersThisMonth = userRepository.countNewCustomersBetween(monthStart, todayEnd);

        // Staff
        Long totalStaff = userRepository.countTotalStaff();

        // Order
        Long totalOrders = dashboardRepository.countTotalOrders();
        Long totalOrdersToday = dashboardRepository.countOrdersBetween(todayStart, todayEnd);

        OrderStatusSummary ordersByStatus = OrderStatusSummary.builder()
                .pending(dashboardRepository.countPendingOrders())
                .confirmed(dashboardRepository.countConfirmedOrders())
                .shipping(dashboardRepository.countShippingOrders())
                .completed(dashboardRepository.countCompletedOrders())
                .cancelled(dashboardRepository.countCancelledOrders())
                .build();

        // Revenue
        Double totalRevenue = dashboardRepository.getTotalRevenue();
        Double revenueToday = dashboardRepository.getRevenueBetween(todayStart, todayEnd);
        Double revenueYesterday = dashboardRepository.getRevenueBetween(yesterdayStart, yesterdayEnd);
        Double revenueThisMonth = dashboardRepository.getRevenueBetween(monthStart, todayEnd);
        Double revenueLastMonth = dashboardRepository.getRevenueBetween(lastMonthStart, lastMonthEnd);

        double todayChangePercent = calcChangePercent(revenueYesterday, revenueToday);
        double monthChangePercent = calcChangePercent(revenueLastMonth, revenueThisMonth);

        // Book
        Long totalBooks = bookRepository.countTotalBooks();
        Long lowStockBooksCount = bookRepository.countLowStockBooks(LOW_STOCK_THRESHOLD);

        // Alert
        boolean revenueDropAlert = revenueYesterday > 0
                && todayChangePercent < -REVENUE_DROP_ALERT_THRESHOLD;

        return DashboardSummaryResponse.builder()
                .totalCustomers(totalCustomers)
                .newCustomersToday(newCustomersToday)
                .newCustomersThisMonth(newCustomersThisMonth)
                .totalStaff(totalStaff)
                .totalOrders(totalOrders)
                .totalOrdersToday(totalOrdersToday)
                .ordersByStatus(ordersByStatus)
                .totalRevenue(totalRevenue)
                .revenueToday(revenueToday)
                .revenueYesterday(revenueYesterday)
                .revenueTodayChangePercent(todayChangePercent)
                .revenueThisMonth(revenueThisMonth)
                .revenueLastMonth(revenueLastMonth)
                .revenueMonthChangePercent(monthChangePercent)
                .totalBooks(totalBooks)
                .lowStockBooksCount(lowStockBooksCount)
                .revenueDropAlert(revenueDropAlert)
                .build();
    }

    /**
     * 2. ADMIN - Get dashboard analytics data (charts, top lists, alerts)
     */
    @Transactional(readOnly = true)
    public DashboardAnalyticsResponse getAnalytics() {
        LocalDateTime thirtyDaysAgo  = LocalDate.now().minusDays(29).atStartOfDay();
        LocalDateTime twelveMonthAgo = LocalDate.now().minusMonths(11).withDayOfMonth(1).atStartOfDay();
        LocalDateTime fiveYearsAgo   = LocalDate.now().minusYears(4).withDayOfYear(1).atStartOfDay();

        return DashboardAnalyticsResponse.builder()
                // Revenue chart
                .dailyRevenue(dashboardMapper.toRevenueDataPointList(
                        dashboardRepository.getDailyRevenue(thirtyDaysAgo)))
                .monthlyRevenue(dashboardMapper.toRevenueDataPointList(
                        dashboardRepository.getMonthlyRevenue(twelveMonthAgo)))
                .yearlyRevenue(dashboardMapper.toRevenueDataPointList(
                        dashboardRepository.getYearlyRevenue(fiveYearsAgo)))

                // Top lists
                .topSellingBooks(dashboardMapper.toTopBookResponseList(
                        dashboardRepository.findTopSellingBooks(TOP_BOOKS_LIMIT)))
                .topCustomers(dashboardMapper.toTopCustomerResponseList(
                        dashboardRepository.findTopCustomers(TOP_CUSTOMERS_LIMIT)))

                // low stock alert
                .lowStockBooks(bookRepository.findLowStockBooks(LOW_STOCK_THRESHOLD))
                .build();
    }

    // ════════════════════════════════════════════════════════════
    // HELPER
    // ════════════════════════════════════════════════════════════

    /**
     * Calculate % change between old value and new value.
     */
    private double calcChangePercent(Double oldValue, Double newValue) {
        if (oldValue == null || oldValue == 0) return 0.0;
        return Math.round(((newValue - oldValue) / oldValue) * 100.0 * 10) / 10.0;
    }
}