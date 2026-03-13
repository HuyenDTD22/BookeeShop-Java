package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.OrderStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BulkOrderStatusUpdateRequest {

    @NotEmpty(message = "Order IDs must not be empty")
    List<UUID> orderIds;

    @NotNull(message = "Status is required")
    OrderStatus status;
}