package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddToCartRequest {

    @NotNull(message = "BOOK_NOT_FOUND")
    UUID bookId;

    @NotNull
    @Min(value = 1, message = "QUANTITY_MUST_BE_POSITIVE")
    Integer quantity;

}