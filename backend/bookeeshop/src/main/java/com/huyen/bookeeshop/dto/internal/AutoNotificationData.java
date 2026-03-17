package com.huyen.bookeeshop.dto.internal;

import com.huyen.bookeeshop.enums.NotificationType;
import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class AutoNotificationData {
    UUID recipientUserId;

    String title;

    String content;

    NotificationType type;

    // ID tham chiếu để frontend navigate đến đúng trang khi user bấm vào thông báo.
    String refId;
}