package com.huyen.bookeeshop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

/**
 * Filter request dùng cho admin lấy danh sách sách.
 * Hỗ trợ tìm kiếm, lọc danh mục, lọc trạng thái, phân trang, sắp xếp.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminBookFilterRequest {

    // Phân trang
    @Builder.Default
    int page = 0;

    @Builder.Default
    int size = 10;

    String keyword;

    UUID categoryId;

    Boolean feature;

    Boolean inStock;

    // Sort: title | price | createdAt | stock
    @Builder.Default
    String sortBy = "createdAt";

    // Sort: asc | desc
    @Builder.Default
    String sortDir = "desc";
}