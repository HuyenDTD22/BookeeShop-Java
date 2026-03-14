package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookCardResponse {

    UUID id;

    String thumbnail;

    String title;

    String author;

    Double price;

    Double discountPercentage;

    Double finalPrice;

    Boolean inStock;

    Double averageRating;

    Long totalRatings;

    Long purchaseCount;

    String categoryName;
}