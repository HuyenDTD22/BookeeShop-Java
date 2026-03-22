package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopBookResponse {
    UUID bookId;
    String title;
    String thumbnail;
    String author;
    Double price;
    Long totalSold;
    Double totalRevenue;
}