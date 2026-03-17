package com.huyen.bookeeshop.dto.response;

import com.huyen.bookeeshop.enums.NotificationAudienceType;
import com.huyen.bookeeshop.enums.NotificationStatus;
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
public class NotificationResponse {
    UUID id;

    String title;

    String content;

    NotificationType type;

    NotificationStatus status;

    NotificationAudienceType audienceType;

    String targetRole;

    String refId;

    LocalDateTime scheduledAt;

    LocalDateTime sentAt;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;

    String createdBy;

    int totalRecipients;

    int readCount;
}