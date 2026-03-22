package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Order;
import com.huyen.bookeeshop.repository.projection.RevenueDataPointProjection;
import com.huyen.bookeeshop.repository.projection.TopBookProjection;
import com.huyen.bookeeshop.repository.projection.TopCustomerProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    // ════════════════════════════════════════════════════════════
    // Order statistics
    // ════════════════════════════════════════════════════════════

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false")
    Long countTotalOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.createdAt BETWEEN :from AND :to")
    Long countOrdersBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = com.huyen.bookeeshop.enums.OrderStatus.PENDING")
    Long countPendingOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = com.huyen.bookeeshop.enums.OrderStatus.CONFIRMED")
    Long countConfirmedOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = com.huyen.bookeeshop.enums.OrderStatus.SHIPPING")
    Long countShippingOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = com.huyen.bookeeshop.enums.OrderStatus.COMPLETED")
    Long countCompletedOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false AND o.status = com.huyen.bookeeshop.enums.OrderStatus.CANCELLED")
    Long countCancelledOrders();

    // ════════════════════════════════════════════════════════════
    // Revenue statistics
    // ════════════════════════════════════════════════════════════

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.deleted = false
          AND o.status = com.huyen.bookeeshop.enums.OrderStatus.COMPLETED
    """)
    Double getTotalRevenue();

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.deleted = false
          AND o.status = com.huyen.bookeeshop.enums.OrderStatus.COMPLETED
          AND o.createdAt BETWEEN :from AND :to
    """)
    Double getRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    // ════════════════════════════════════════════════════════════
    // Daily Revenue Chart (Last 30 Days)
    // ════════════════════════════════════════════════════════════
    @Query(value = """
        SELECT TO_CHAR(o.created_at, 'YYYY-MM-DD')  AS label,
               COALESCE(SUM(o.total_amount), 0)      AS revenue,
               COUNT(o.id)                           AS orderCount
        FROM orders o
        WHERE o.deleted = false
          AND o.status   = 'COMPLETED'
          AND o.created_at >= :from
        GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
        ORDER BY label ASC
    """, nativeQuery = true)
    List<RevenueDataPointProjection> getDailyRevenue(@Param("from") LocalDateTime from);

    // ════════════════════════════════════════════════════════════
    // Monthly Revenue Chart (Last 12 Months)
    // ════════════════════════════════════════════════════════════
    @Query(value = """
        SELECT TO_CHAR(o.created_at, 'YYYY-MM')  AS label,
               COALESCE(SUM(o.total_amount), 0)  AS revenue,
               COUNT(o.id)                       AS orderCount
        FROM orders o
        WHERE o.deleted = false
          AND o.status   = 'COMPLETED'
          AND o.created_at >= :from
        GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
        ORDER BY label ASC
    """, nativeQuery = true)
    List<RevenueDataPointProjection> getMonthlyRevenue(@Param("from") LocalDateTime from);

    // ════════════════════════════════════════════════════════════
    // Annual Revenue Chart (Last 5 Years)
    // ════════════════════════════════════════════════════════════
    @Query(value = """
        SELECT TO_CHAR(o.created_at, 'YYYY')     AS label,
               COALESCE(SUM(o.total_amount), 0)  AS revenue,
               COUNT(o.id)                       AS orderCount
        FROM orders o
        WHERE o.deleted = false
          AND o.status   = 'COMPLETED'
          AND o.created_at >= :from
        GROUP BY TO_CHAR(o.created_at, 'YYYY')
        ORDER BY label ASC
    """, nativeQuery = true)
    List<RevenueDataPointProjection> getYearlyRevenue(@Param("from") LocalDateTime from);

    // ════════════════════════════════════════════════════════════
    // TOP 10 best-selling books
    // ════════════════════════════════════════════════════════════
    @Query(value = """
        SELECT oi.book_id                              AS bookId,
               b.title                                AS title,
               b.thumbnail                            AS thumbnail,
               b.author                               AS author,
               b.price                                AS price,
               SUM(oi.quantity)                       AS totalSold,
               SUM(oi.price * oi.quantity
                   * (1 - COALESCE(oi.discount_percentage, 0) / 100))
                                                      AS totalRevenue
        FROM order_items oi
        JOIN orders     o ON o.id = oi.order_id
        JOIN books      b ON b.id = oi.book_id
        WHERE o.deleted = false
          AND o.status  = 'COMPLETED'
          AND b.deleted = false
        GROUP BY oi.book_id, b.title, b.thumbnail, b.author, b.price
        ORDER BY totalSold DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<TopBookProjection> findTopSellingBooks(@Param("limit") int limit);

    // ════════════════════════════════════════════════════════════
    // TOP customers with the highest purchases
    // ════════════════════════════════════════════════════════════
    @Query(value = """
        SELECT u.id                               AS userId,
               u.full_name                        AS fullName,
               u.username                         AS username,
               u.avatar                           AS avatar,
               COUNT(o.id)                        AS totalOrders,
               COALESCE(SUM(o.total_amount), 0)   AS totalSpent
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.deleted = false
          AND o.status  = 'COMPLETED'
          AND u.deleted = false
        GROUP BY u.id, u.full_name, u.username, u.avatar
        ORDER BY totalSpent DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<TopCustomerProjection> findTopCustomers(@Param("limit") int limit);
}