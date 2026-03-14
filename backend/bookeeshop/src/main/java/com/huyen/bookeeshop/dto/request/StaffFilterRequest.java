package com.huyen.bookeeshop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffFilterRequest {

    @Builder.Default
    int page = 0;

    @Builder.Default
    int size = 20;

    // Tìm kiếm theo tên hoặc số điện thoại
    String keyword;

    UUID roleId;

    Boolean locked;

    // Sort: createdAt | fullName
    @Builder.Default
    String sortBy = "createdAt";

    // Sort: asc | desc
    @Builder.Default
    String sortDir = "desc";
}