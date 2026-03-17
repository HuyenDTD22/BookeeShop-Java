package com.huyen.bookeeshop.enums;

/**
 * - ALL           : Toàn bộ user trong hệ thống
 * - BY_ROLE       : Tất cả user thuộc một role cụ thể
 * - SPECIFIC_USERS: Danh sách user được chỉ định cụ thể
 */
public enum NotificationAudienceType {
    ALL,
    BY_ROLE,
    SPECIFIC_USERS
}