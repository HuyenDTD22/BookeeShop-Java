package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;


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
    @Min(0)
    Double price;

    @NotNull
    @Min(0)
    Double discountPercentage;

    @NotNull
    @Min(0)
    Integer stock;

    @NotBlank
    String author;

    @NotBlank
    String supplier;

    @NotBlank
    String publisher;

    @NotNull
    Integer publishYear;

    @NotBlank
    String language;

    @NotBlank
    String size;

    @NotNull
    @Min(0)
    Double weight;

    @NotNull
    @Min(1)
    Integer pageCount;

    @NotNull
    Boolean feature;

    @NotNull
    UUID categoryId;

}
