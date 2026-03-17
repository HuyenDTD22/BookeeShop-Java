package com.huyen.bookeeshop.dto.internal;

import com.huyen.bookeeshop.entity.Book;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItemData {
    Book book;
    Integer quantity;
    Double unitPrice;
    Double subtotal;
}