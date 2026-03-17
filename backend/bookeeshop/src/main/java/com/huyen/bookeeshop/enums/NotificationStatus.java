package com.huyen.bookeeshop.enums;

/**
 * - DRAFT     : Đang soạn, chưa gửi (lên lịch chưa đến giờ hoặc chưa publish)
 * - SCHEDULED : Đã lên lịch, chờ đến giờ gửi
 * - SENT      : Đã gửi đến người nhận
 * - CANCELLED : Đã bị huỷ trước khi gửi
 */
public enum NotificationStatus {
    DRAFT,
    SCHEDULED,
    SENT,
    CANCELLED
}