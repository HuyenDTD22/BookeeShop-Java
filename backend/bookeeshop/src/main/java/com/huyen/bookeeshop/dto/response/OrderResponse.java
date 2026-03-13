package com.huyen.bookeeshop.dto.response;

import com.huyen.bookeeshop.enums.OrderStatus;
import com.huyen.bookeeshop.enums.PaymentMethod;
import com.huyen.bookeeshop.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    UUID id;
    String fullName;
    String phone;
    String address;
    PaymentStatus paymentStatus;
    PaymentMethod paymentMethod;
    Double totalAmount;
    OrderStatus status;
    LocalDateTime createdAt;

    // User info
    UUID userId;
    String userEmail;

    List<OrderItemResponse> orderItems;
}