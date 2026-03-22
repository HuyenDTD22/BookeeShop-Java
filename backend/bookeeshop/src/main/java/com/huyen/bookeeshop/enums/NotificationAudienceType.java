package com.huyen.bookeeshop.enums;

/**
 * - ALL             : Toàn bộ user trong hệ thống
 * - CUSTOMERS       : Chỉ khách hàng (role USER)
 * - STAFF           : Chỉ nhân viên (role STAFF_*)
 * - BY_ROLE         : Tất cả user thuộc một role cụ thể
 * - SPECIFIC_USERS  : Danh sách user được chỉ định cụ thể
 */
public enum NotificationAudienceType {
    ALL,
    CUSTOMERS,
    STAFF,
    BY_ROLE,
    SPECIFIC_USERS
}