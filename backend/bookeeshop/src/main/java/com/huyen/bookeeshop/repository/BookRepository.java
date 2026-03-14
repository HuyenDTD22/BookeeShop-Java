package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    List<Book> findAllByDeletedFalse();

    Page<Book> findAllByDeletedFalse(Pageable pageable);

    Page<Book> findAllByFeatureTrueAndDeletedFalse(Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.category.id IN :categoryIds AND b.deleted = false")
    Page<Book> findAllByCategoryIdInAndDeletedFalse(@Param("categoryIds") List<UUID> categoryIds, Pageable pageable);

    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.book.id = :bookId")
    Long countPurchasesByBookId(@Param("bookId") UUID bookId);

    @Query("SELECT COALESCE(AVG(r.value), 0.0) FROM Rating r WHERE r.book.id = :bookId AND r.deleted = false")
    Double getAverageRatingByBookId(@Param("bookId") UUID bookId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.book.id = :bookId AND r.deleted = false")
    Long countRatingsByBookId(@Param("bookId") UUID bookId);

    @Query("""
        SELECT c.id FROM Category c
        WHERE c.parent.id = :parentId AND c.deleted = false
    """)
    List<UUID> findChildCategoryIds(@Param("parentId") UUID parentId);

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
}
