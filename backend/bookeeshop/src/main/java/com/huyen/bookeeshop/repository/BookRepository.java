package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.dto.response.LowStockBookResponse;
import com.huyen.bookeeshop.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface BookRepository extends JpaRepository<Book, UUID>, JpaSpecificationExecutor<Book> {

    Optional<Book> findByIdAndDeletedFalse(UUID id);

    boolean existsByIdAndDeletedFalse(UUID id);

    @Query("""
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM OrderItem oi
    JOIN oi.order o
    WHERE oi.book.id = :bookId
      AND o.status  = com.huyen.bookeeshop.enums.OrderStatus.COMPLETED
      AND o.deleted = false
    """)
    Long countPurchasesByBookId(@Param("bookId") UUID bookId);

    @Query("SELECT COALESCE(AVG(r.value), 0.0) FROM Rating r WHERE r.book.id = :bookId AND r.deleted = false")
    Double getAverageRatingByBookId(@Param("bookId") UUID bookId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.book.id = :bookId AND r.deleted = false")
    Long countRatingsByBookId(@Param("bookId") UUID bookId);

    @Query(value = """
        WITH RECURSIVE category_tree AS (
            SELECT id FROM categories WHERE id = :rootId AND deleted = false
            UNION ALL
            SELECT c.id FROM categories c
            INNER JOIN category_tree ct ON c.parent_id = ct.id
            WHERE c.deleted = false
        )
        SELECT id FROM category_tree
    """, nativeQuery = true)
    List<UUID> findAllDescendantCategoryIds(@Param("rootId") UUID rootId);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.deleted = false")
    Long countTotalBooks();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.deleted = false AND b.stock <= :threshold AND b.stock > 0")
    Long countLowStockBooks(@Param("threshold") int threshold);

    @Query("""
        SELECT new com.huyen.bookeeshop.dto.response.LowStockBookResponse(
            b.id, b.title, b.thumbnail, b.stock
        )
        FROM Book b
        WHERE b.deleted = false
          AND b.stock  <= :threshold
          AND b.stock   > 0
        ORDER BY b.stock ASC
    """)
    List<LowStockBookResponse> findLowStockBooks(@Param("threshold") int threshold);
}
