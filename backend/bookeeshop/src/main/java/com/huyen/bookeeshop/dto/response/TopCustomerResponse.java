package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopCustomerResponse {
    UUID userId;
    String fullName;
    String username;
    String avatar;
    Long totalOrders;
    Double totalSpent;
}