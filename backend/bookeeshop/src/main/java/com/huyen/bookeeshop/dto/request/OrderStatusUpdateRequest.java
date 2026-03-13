package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatusUpdateRequest {

    @NotNull(message = "Status is required")
    OrderStatus status;
}