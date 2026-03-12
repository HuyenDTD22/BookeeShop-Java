package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookResponse {
    UUID id;

    String title;

    String thumbnail;

    String description;

    Double price;

    Double discountPercentage;

    Integer stock;

    String author;

    String supplier;

    String publisher;

    Integer publishYear;

    String language;

    String size;

    Double weight;

    Integer pageCount;

    Boolean feature;

    LocalDateTime createdAt;

}
