package com.huyen.bookeeshop.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookUpdateRequest {
    String title;

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

}
