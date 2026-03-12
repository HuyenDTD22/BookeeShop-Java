package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookCreationRequest {
    @NotBlank
    String title;

    @NotBlank
    String description;

    @NotNull
    Double price;

    @NotNull
    Double discountPercentage;

    @NotNull
    Integer stock;

    @NotBlank
    String author;

    @NotBlank
    String supplier;

    @NotBlank
    String publisher;

    @NotBlank
    Integer publishYear;

    @NotBlank
    String language;

    @NotBlank
    String size;

    @NotNull
    Double weight;

    @NotNull
    Integer pageCount;

    @NotNull
    Boolean feature;

}
