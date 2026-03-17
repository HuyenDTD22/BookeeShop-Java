package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, UUID> {

    // Kiểm tra user đã rating quyển sách này chưa (chỉ tính rating chưa bị xóa).
    @Query("SELECT COUNT(r) > 0 FROM Rating r WHERE r.user.id = :userId AND r.book.id = :bookId AND r.deleted = false")
    boolean existsByUserIdAndBookId(@Param("userId") UUID userId, @Param("bookId") UUID bookId);

    // Tìm rating theo id và userId
    @Query("SELECT r FROM Rating r WHERE r.id = :ratingId AND r.user.id = :userId AND r.deleted = false")
    Optional<Rating> findByIdAndUserId(@Param("ratingId") UUID ratingId, @Param("userId") UUID userId);

    // Kiểm tra user có đơn hàng COMPLETED chứa sách này không.
    @Query("""
            SELECT COUNT(oi) > 0
            FROM OrderItem oi
            JOIN oi.order o
            WHERE o.user.id = :userId
              AND oi.book.id = :bookId
              AND o.status = com.huyen.bookeeshop.enums.OrderStatus.COMPLETED
              AND o.deleted = false
            """)
    boolean hasUserPurchasedBook(@Param("userId") UUID userId, @Param("bookId") UUID bookId);

    // Tính điểm trung bình rating của 1 quyển sách.
    @Query("SELECT COALESCE(AVG(r.value), 0.0) FROM Rating r WHERE r.book.id = :bookId AND r.deleted = false")
    Double getAverageRatingByBookId(@Param("bookId") UUID bookId);

    // Lấy tất cả rating của 1 quyển sách.
    @Query("SELECT r FROM Rating r WHERE r.book.id = :bookId AND r.deleted = false ORDER BY r.createdAt DESC")
    List<Rating> findAllByBookIdAndDeletedFalse(UUID bookId);

}