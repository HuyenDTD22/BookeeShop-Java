package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.OrderStatus;
import com.huyen.bookeeshop.enums.PaymentMethod;
import com.huyen.bookeeshop.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderFilterRequest {

    PaymentMethod paymentMethod;
    PaymentStatus paymentStatus;
    OrderStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime toDate;

    // Sort: "newest" | "oldest" — default newest
    String sortBy = "newest";

    // Pagination
    int page = 0;
    int size = 10;
}