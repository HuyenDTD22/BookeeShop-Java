package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderCreationRequest {
    @NotBlank(message = "Full name is required")
    String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\d{10,11}$", message = "PHONE_INVALID")
    String phone;

    @NotBlank(message = "Address is required")
    String address;

    String note;

    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod;

    // Mua ngay
    UUID bookId;

    // Mua qua giỏ hàng
    List<UUID> cartItemIds;

    @Min(value = 1, message = "Quantity must be at least 1")
    Integer quantity;
}
