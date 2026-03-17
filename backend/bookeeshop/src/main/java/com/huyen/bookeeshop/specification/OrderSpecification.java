package com.huyen.bookeeshop.specification;

import com.huyen.bookeeshop.dto.request.OrderFilterRequest;
import com.huyen.bookeeshop.entity.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    private OrderSpecification() {}

    public static Specification<Order> filter(OrderFilterRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always exclude soft-deleted orders
            predicates.add(cb.equal(root.get("deleted"), false));

            // Filter by PaymentMethod
            if (request.getPaymentMethod() != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), request.getPaymentMethod()));
            }

            // Filter by PaymentStatus
            if (request.getPaymentStatus() != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), request.getPaymentStatus()));
            }

            // Filter by OrderStatus
            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            // Filter by date range
            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFromDate()));
            }
            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), request.getToDate()));
            }

            // Tìm theo tên hoặc số điện thoại (không phân biệt hoa thường)
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String kw = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate byName = cb.like(cb.lower(root.get("fullName")), kw);
                Predicate byPhone = cb.like(root.get("phone"), kw);
                predicates.add(cb.or(byName, byPhone));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}