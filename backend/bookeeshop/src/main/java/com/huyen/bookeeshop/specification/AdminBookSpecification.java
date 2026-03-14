package com.huyen.bookeeshop.specification;

import com.huyen.bookeeshop.dto.request.AdminBookFilterRequest;
import com.huyen.bookeeshop.entity.Book;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AdminBookSpecification {

    private AdminBookSpecification() {}

    public static Specification<Book> withFilter(AdminBookFilterRequest filter, List<UUID> categoryIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Chỉ lấy sách chưa bị xóa
            predicates.add(cb.isFalse(root.get("deleted")));

            // Tìm kiếm theo keyword (title hoặc author)
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String pattern = "%" + filter.getKeyword().toLowerCase().trim() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate authorMatch = cb.like(cb.lower(root.get("author")), pattern);
                predicates.add(cb.or(titleMatch, authorMatch));
            }

            // Lọc theo danh mục (bao gồm danh mục con)
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            // Lọc theo feature
            if (filter.getFeature() != null) {
                predicates.add(cb.equal(root.get("feature"), filter.getFeature()));
            }

            // Lọc theo tồn kho
            if (filter.getInStock() != null) {
                if (filter.getInStock()) {
                    predicates.add(cb.greaterThan(root.get("stock"), 0));
                } else {
                    predicates.add(cb.equal(root.get("stock"), 0));
                }
            }

            assert query != null;
            query.distinct(true);

            applySorting(root, query, cb, filter);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void applySorting(Root<Book> root, CriteriaQuery<?> query,
                                     CriteriaBuilder cb, AdminBookFilterRequest filter) {
        boolean isDesc = "desc".equalsIgnoreCase(filter.getSortDir());
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";

        Expression<?> sortExpr = switch (sortBy) {
            case "title"     -> root.get("title");
            case "price"     -> root.get("price");
            case "stock"     -> root.get("stock");
            default          -> root.get("createdAt");
        };

        query.orderBy(isDesc ? cb.desc(sortExpr) : cb.asc(sortExpr));
    }
}