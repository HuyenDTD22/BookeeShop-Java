package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.NotificationStatus;
import com.huyen.bookeeshop.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationFilterRequest {

    NotificationType type;

    NotificationStatus status;

    // Tìm theo tiêu đề / nội dung
    String keyword;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime toDate;

    // "newest" | "oldest" — default newest
    @Builder.Default
    String sortBy = "newest";

    // Pagination
    @Builder.Default
    int page = 0;

    @Builder.Default
    int size = 10;
}