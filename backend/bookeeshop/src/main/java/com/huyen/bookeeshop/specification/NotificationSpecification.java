package com.huyen.bookeeshop.specification;

import com.huyen.bookeeshop.dto.request.NotificationFilterRequest;
import com.huyen.bookeeshop.entity.Notification;
import com.huyen.bookeeshop.enums.NotificationType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class NotificationSpecification {

    private NotificationSpecification() {}

    // Specification dùng cho Admin
    public static Specification<Notification> adminFilter(NotificationFilterRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Luôn loại trừ soft-deleted
            predicates.add(cb.equal(root.get("deleted"), false));

            // Admin list KHÔNG hiển thị thông báo tự động hệ thống gửi cho khách
            predicates.add(root.get("type").in(
                    NotificationType.PROMOTION,
                    NotificationType.ANNOUNCEMENT,
                    NotificationType.SYSTEM
            ));

            // Filter theo type
            if (request.getType() != null) {
                predicates.add(cb.equal(root.get("type"), request.getType()));
            }

            // Filter theo status
            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            // Filter theo khoảng thời gian tạo
            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFromDate()));
            }
            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), request.getToDate()));
            }

            // Tìm theo tiêu đề hoặc nội dung
            if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
                String kw = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate byTitle   = cb.like(cb.lower(root.get("title")), kw);
                Predicate byContent = cb.like(cb.lower(root.get("content")), kw);
                predicates.add(cb.or(byTitle, byContent));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Specification dùng cho Client
    public static Specification<Notification> clientFilter(
            NotificationFilterRequest request, java.util.UUID userId) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("deleted"), false));

            // Chỉ lấy thông báo mà user này là người nhận
            var subquery = query.subquery(java.util.UUID.class);
            var unRoot = subquery.from(com.huyen.bookeeshop.entity.UserNotification.class);
            subquery.select(unRoot.get("notification").get("id"))
                    .where(cb.equal(unRoot.get("user").get("id"), userId));
            predicates.add(root.get("id").in(subquery));

            if (request.getType() != null) {
                predicates.add(cb.equal(root.get("type"), request.getType()));
            }
            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), request.getFromDate()));
            }
            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), request.getToDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}