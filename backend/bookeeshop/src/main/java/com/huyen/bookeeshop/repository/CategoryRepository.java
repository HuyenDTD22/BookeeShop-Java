package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByIdAndDeletedFalse(UUID id);

    List<Category> findAllByDeletedFalse();

    boolean existsByNameAndDeletedFalse(String name);

    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.deleted = false ORDER BY c.createdAt ASC")
    List<Category> findRootCategories();

    // Kiểm tra danh mục có danh mục con đang active không
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.parent.id = :parentId AND c.deleted = false")
    boolean hasActiveChildren(@Param("parentId") UUID parentId);

    // Kiểm tra danh mục có sách đang active không
    @Query("SELECT COUNT(b) > 0 FROM Book b WHERE b.category.id = :categoryId AND b.deleted = false")
    boolean hasActiveBooks(@Param("categoryId") UUID categoryId);

}
