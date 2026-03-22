package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemUpdateRequest {

    @NotNull
    UUID orderItemId;

    @NotNull
    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantity;
}