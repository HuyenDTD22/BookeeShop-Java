package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemResponse {
    UUID id;
    String title;
    Double price;
    Double discountPercentage;
    Integer quantity;
    Double subtotal;
    UUID bookId;
    String thumbnail;

}