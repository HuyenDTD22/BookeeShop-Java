package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    // Lấy tất cả comment GỐC chưa bị xóa của 1 quyển sách
    @Query("""
            SELECT c FROM Comment c
            WHERE c.book.id = :bookId
              AND c.parent IS NULL
              AND c.deleted = false
            ORDER BY c.createdAt DESC
            """)
    List<Comment> findRootCommentsByBookId(@Param("bookId") UUID bookId);

    Optional<Comment> findByIdAndDeletedFalse(UUID id);

    // Tìm comment theo id và userId
    @Query("""
            SELECT c FROM Comment c
            WHERE c.id = :commentId
              AND c.user.id = :userId
              AND c.user.deleted = false 
              AND c.deleted = false
            """)
    Optional<Comment> findByIdAndUserId(@Param("commentId") UUID commentId, @Param("userId") UUID userId);

    // Kiểm tra user đã có đơn hàng COMPLETED chứa sách này chưa.
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

}