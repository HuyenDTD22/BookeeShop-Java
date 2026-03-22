package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.enums.NotificationAudienceType;
import com.huyen.bookeeshop.enums.NotificationType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
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
public class NotificationUpdateRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    String title;

    String content;

    NotificationType type;

    NotificationAudienceType audienceType;

    String targetRole;

    List<UUID> targetUserIds;

    @Future(message = "Scheduled time must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    LocalDateTime scheduledAt;

    // true = xóa lịch gửi, chuyển về DRAFT
    Boolean removeSchedule;
}