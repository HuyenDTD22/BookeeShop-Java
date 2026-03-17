package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.NotificationAudienceType;
import com.huyen.bookeeshop.enums.NotificationType;
import com.huyen.bookeeshop.validator.ValidNotificationAudience;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@ValidNotificationAudience
public class NotificationCreationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    String title;

    @NotBlank(message = "Content is required")
    String content;

    @NotNull(message = "Notification type is required")
    NotificationType type;

    @NotNull(message = "Audience type is required")
    NotificationAudienceType audienceType;

    // Bắt buộc khi audienceType = BY_ROLE
    String targetRole;

    // Bắt buộc khi audienceType = SPECIFIC_USERS
    List<UUID> targetUserIds;

    // null = gửi ngay; non-null = lên lịch gửi theo giờ này
    @Future(message = "Scheduled time must be in the future")
    LocalDateTime scheduledAt;
}