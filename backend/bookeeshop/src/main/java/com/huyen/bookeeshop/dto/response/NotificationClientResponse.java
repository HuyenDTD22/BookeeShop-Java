package com.huyen.bookeeshop.dto.response;

import com.huyen.bookeeshop.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationClientResponse {
    UUID id;

    String title;

    String content;

    NotificationType type;

    // refId cho phép frontend navigate đến đúng trang
    String refId;

    LocalDateTime sentAt;

    LocalDateTime createdAt;

    boolean isRead;

    LocalDateTime readAt;
}