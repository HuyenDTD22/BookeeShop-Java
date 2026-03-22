package com.huyen.bookeeshop.specification;

import com.huyen.bookeeshop.dto.request.BookFilterRequest;
import com.huyen.bookeeshop.entity.Book;
import com.huyen.bookeeshop.entity.Rating;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookSpecification {

    private BookSpecification() {}

    // Build Specification cho tất cả sách (không lọc category)
    public static Specification<Book> withFilter(BookFilterRequest filter) {
        return buildSpec(filter, null);
    }

    // Build Specification cho sách nổi bật
    public static Specification<Book> featuredWithFilter(BookFilterRequest filter) {
        return (root, query, cb) -> {
            Specification<Book> base = buildSpec(filter, null);

            Predicate basePredicate = base.toPredicate(root, query, cb);
            Predicate featurePredicate = cb.isTrue(root.get("feature"));

            return cb.and(basePredicate, featurePredicate);
        };
    }

    // Build Specification lọc theo danh sách categoryId (hỗ trợ category + children)
    public static Specification<Book> withFilterAndCategories(BookFilterRequest filter, List<UUID> categoryIds) {
        return buildSpec(filter, categoryIds);
    }

    private static Specification<Book> buildSpec(BookFilterRequest filter, List<UUID> categoryIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Soft delete
            predicates.add(cb.isFalse(root.get("deleted")));

            // Lọc theo categoryId
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            // Lọc theo rating
            if (filter.getMinRating() != null || filter.getMaxRating() != null) {
                Subquery<Double> ratingSubquery = query.subquery(Double.class);
                Root<?> ratingRoot = ratingSubquery.from(Rating.class);

                ratingSubquery.select(cb.avg(ratingRoot.get("value")))
                        .where(
                                cb.equal(ratingRoot.get("book"), root),
                                cb.isFalse(ratingRoot.get("deleted"))
                        );

                Expression<Double> avgRating = cb.coalesce(ratingSubquery, 0.0);

                if (filter.getMinRating() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(avgRating, filter.getMinRating()));
                }
                if (filter.getMaxRating() != null) {
                    predicates.add(cb.lessThanOrEqualTo(avgRating, filter.getMaxRating()));
                }
            }

            if (query != null) query.distinct(true);

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}