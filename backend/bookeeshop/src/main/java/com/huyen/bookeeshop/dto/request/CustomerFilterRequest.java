package com.huyen.bookeeshop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerFilterRequest {

    @Builder.Default
    int page = 0;

    @Builder.Default
    int size = 10;

    // Tìm kiếm theo tên hoặc số điện thoại
    String keyword;

    Boolean locked;

    // Sort: createdAt | fullName
    @Builder.Default
    String sortBy = "createdAt";

    // Sort: asc | desc
    @Builder.Default
    String sortDir = "desc";
}