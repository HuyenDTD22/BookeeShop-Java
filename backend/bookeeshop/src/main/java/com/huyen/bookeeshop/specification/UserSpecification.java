package com.huyen.bookeeshop.specification;

import com.huyen.bookeeshop.constant.PredefinedRole;
import com.huyen.bookeeshop.dto.request.CustomerFilterRequest;
import com.huyen.bookeeshop.dto.request.StaffFilterRequest;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.entity.User;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    private UserSpecification() {}

    // Specification lấy danh sách nhân viên
    public static Specification<User> staffWithFilter(StaffFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isFalse(root.get("deleted")));

            // Chỉ lấy user là nhân viên (có ít nhất 1 role tên bắt đầu bằng STAFF_)
            Join<User, Role> roleJoin = root.join("roles", JoinType.INNER);
            predicates.add(cb.like(roleJoin.get("name"), "STAFF_%"));

            // Lọc theo role cụ thể
            if (filter.getRoleId() != null) {
                predicates.add(cb.equal(roleJoin.get("id"), filter.getRoleId()));
            }

            // Tìm kiếm theo tên hoặc số điện thoại
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String pattern = "%" + filter.getKeyword().toLowerCase().trim() + "%";

                Predicate nameMatch = cb.like(cb.lower(root.get("fullName")), pattern);
                Predicate phoneMatch = cb.like(root.get("phone"), pattern);

                predicates.add(cb.or(nameMatch, phoneMatch));
            }

            // Lọc theo trạng thái khóa
            if (filter.getLocked() != null) {
                predicates.add(cb.equal(root.get("locked"), filter.getLocked()));
            }

            assert query != null;
            query.distinct(true);
            applySorting(root, query, cb, filter.getSortBy(), filter.getSortDir());

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Specification lấy danh sách khách hàng
    public static Specification<User> customerWithFilter(CustomerFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isFalse(root.get("deleted")));

            // Chỉ lấy khách hàng
            Join<User, Role> roleJoin = root.join("roles", JoinType.INNER);
            predicates.add(cb.equal(roleJoin.get("name"), PredefinedRole.USER_ROLE.getName()));

            // Tìm kiếm theo tên hoặc số điện thoại
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String pattern = "%" + filter.getKeyword().toLowerCase().trim() + "%";

                Predicate nameMatch = cb.like(cb.lower(root.get("fullName")), pattern);
                Predicate phoneMatch = cb.like(root.get("phone"), pattern);

                predicates.add(cb.or(nameMatch, phoneMatch));
            }

            // Lọc theo trạng thái khóa
            if (filter.getLocked() != null) {
                predicates.add(cb.equal(root.get("locked"), filter.getLocked()));
            }

            assert query != null;
            query.distinct(true);
            applySorting(root, query, cb, filter.getSortBy(), filter.getSortDir());

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void applySorting(Root<User> root, CriteriaQuery<?> query,
                                     CriteriaBuilder cb, String sortBy, String sortDir) {
        boolean isDesc = "desc".equalsIgnoreCase(sortDir);

        Expression<?> sortExpr = "fullName".equals(sortBy)
                ? root.get("fullName")
                : root.get("createdAt");

        query.orderBy(isDesc ? cb.desc(sortExpr) : cb.asc(sortExpr));
    }
}