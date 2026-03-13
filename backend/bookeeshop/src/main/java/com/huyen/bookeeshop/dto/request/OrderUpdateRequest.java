package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.OrderStatus;
import com.huyen.bookeeshop.enums.PaymentMethod;
import com.huyen.bookeeshop.enums.PaymentStatus;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderUpdateRequest {
    String fullName;

    @Pattern(regexp = "^\\d{10,11}$", message = "Phone number is invalid")
    String phone;

    String address;

    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    OrderStatus status;
}