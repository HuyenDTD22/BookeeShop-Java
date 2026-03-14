package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookDetailResponse {
    UUID id;

    String thumbnail;

    String title;

    String description;

    String author;

    Double price;

    Double discountPercentage;

    Double finalPrice;

    Integer stock;

    Boolean inStock;

    String publisher;

    String supplier;

    Integer publishYear;

    String language;

    String size;

    Double weight;

    Integer pageCount;

    Boolean feature;

    LocalDateTime createdAt;

    UUID categoryId;

    String categoryName;

    Double averageRating;

    Long totalRatings;

    Long purchaseCount;
}