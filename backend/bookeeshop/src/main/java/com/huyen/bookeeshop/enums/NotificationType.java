package com.huyen.bookeeshop.enums;
/**
 * - ORDER_PLACED            : Hệ thống tự gửi khi khách đặt hàng thành công
 * - ORDER_STATUS_CHANGED    : Hệ thống tự gửi khi trạng thái đơn hàng thay đổi
 * - PROMOTION               : Admin tạo thủ công — chương trình khuyến mãi/giảm giá
 * - FLASH_SALE              : Admin tạo thủ công — flash sale giới hạn thời gian
 * - ANNOUNCEMENT            : Admin tạo thủ công — thông báo chung (bảo trì, cập nhật,...)
 * - SYSTEM                  : Admin tạo thủ công — thông báo nội bộ hệ thống cho staff
 */
public enum NotificationType {
    ORDER_PLACED,
    ORDER_STATUS_CHANGED,
    PROMOTION,
    FLASH_SALE,
    ANNOUNCEMENT,
    SYSTEM
}