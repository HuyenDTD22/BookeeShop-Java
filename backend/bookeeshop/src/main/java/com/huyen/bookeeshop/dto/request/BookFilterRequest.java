package com.huyen.bookeeshop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookFilterRequest {

    // Pagination
    @Builder.Default
    int page = 0;

    @Builder.Default
    int size = 10;

    // Filter
    Double minRating;
    Double maxRating;

    // Sort fields: "rating", "createdAt", "purchaseCount", "title", "price"
    @Builder.Default
    String sortBy = "createdAt";

    // Sort direction: "asc" | "desc"
    @Builder.Default
    String sortDir = "desc";
}