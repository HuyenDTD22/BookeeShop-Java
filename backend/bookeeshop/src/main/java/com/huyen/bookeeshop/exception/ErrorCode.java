package com.huyen.bookeeshop.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {

    // ==========================
    // COMMON / SYSTEM
    // ==========================
    UNCATEGORIZED_EXCEPTION(9999, "Unexpected server error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),

    // ==========================
    // AUTHENTICATION & AUTHORIZATION
    // ==========================
    UNAUTHENTICATED(1100, "Authentication required", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1101, "You do not have permission to access this resource", HttpStatus.FORBIDDEN),

    // ==========================
    // VALIDATION - USER INPUT
    // ==========================
    USERNAME_REQUIRED(1200, "Username must not be blank", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1201, "Username must be between 3 and 50 characters", HttpStatus.BAD_REQUEST),

    PASSWORD_REQUIRED(1202, "Password must not be blank", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1203, "Password must be between 8 and 100 characters", HttpStatus.BAD_REQUEST),

    FULLNAME_REQUIRED(1204, "Full name must not be blank", HttpStatus.BAD_REQUEST),
    FULLNAME_INVALID(1205, "Full name must not exceed 100 characters", HttpStatus.BAD_REQUEST),

    DOB_REQUIRED(1206, "Date of birth must not be null", HttpStatus.BAD_REQUEST),
    INVALID_DOB(1207, "Age must be at least {min}", HttpStatus.BAD_REQUEST),

    GENDER_REQUIRED(1208, "Gender must not be blank", HttpStatus.BAD_REQUEST),

    PHONE_REQUIRED(1209, "Phone number must not be blank", HttpStatus.BAD_REQUEST),
    PHONE_INVALID(1210, "Phone number must be 10 to 11 digits", HttpStatus.BAD_REQUEST),

    ADDRESS_REQUIRED(1211, "Address must not be blank", HttpStatus.BAD_REQUEST),
    ADDRESS_INVALID(1212, "Address must not exceed 255 characters", HttpStatus.BAD_REQUEST),

    QUANTITY_MUST_BE_POSITIVE(1213, "Quantity must be at least 1", HttpStatus.BAD_REQUEST),

    // ==========================
    // USER
    // ==========================
    USER_EXISTED(1300, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1301, "User not found", HttpStatus.NOT_FOUND),
    INVALID_OLD_PASSWORD(1302, "Old password is incorrect", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_YOURSELF(1303, "You cannot delete your own account", HttpStatus.BAD_REQUEST),
    CANNOT_LOCK_YOURSELF(1304, "You cannot lock your own account", HttpStatus.BAD_REQUEST),

    // ==========================
    // ROLE & PERMISSION
    // ==========================
    ROLE_NOT_FOUND(1400, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(1401, "Role already exists", HttpStatus.BAD_REQUEST),
    INVALID_ROLE_ASSIGNMENT(1402, "Cannot assign restricted roles", HttpStatus.BAD_REQUEST),
    INVALID_NAME_ROLE(1403, "Invalid role name", HttpStatus.BAD_REQUEST),
    INVALID_DISPLAY_NAME_ROLE(1404, "Invalid role display name", HttpStatus.BAD_REQUEST),

    PERMISSION_NOT_FOUND(1405, "Permission not found", HttpStatus.NOT_FOUND),

    // ==========================
    // BOOK
    // ==========================
    BOOK_EXISTED(1500, "Book already exists", HttpStatus.BAD_REQUEST),
    BOOK_NOT_FOUND(1501, "Book not found", HttpStatus.NOT_FOUND),
    BOOK_NOT_AVAILABLE(1502, "Book is not available", HttpStatus.BAD_REQUEST),
    BOOK_OUT_OF_STOCK(1503, "Book is out of stock", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK(1504, "Insufficient stock for book: %s", HttpStatus.BAD_REQUEST),

    // ==========================
    // CATEGORY
    // ==========================
    CATEGORY_EXISTED(1600, "Category already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1601, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_CIRCULAR_REFERENCE(1602, "Category cannot reference itself", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_CHILDREN(1603, "Category has child categories", HttpStatus.CONFLICT),
    CATEGORY_HAS_BOOKS(1604, "Category contains books", HttpStatus.CONFLICT),

    // ==========================
    // ORDER
    // ==========================
    ORDER_NOT_FOUND(1700, "Order not found", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_DELETED(1701, "Order has already been deleted", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_MODIFIED(1702, "Order cannot be modified in its current status", HttpStatus.BAD_REQUEST),
    ORDER_BULK_UPDATE_FAILED(1703, "Some orders could not be updated", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS_TRANSITION(1704, "Invalid order status transition", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELLED(1705, "Order can only be cancelled when status is PENDING", HttpStatus.BAD_REQUEST),
    ORDER_NOT_OWNED(1706, "You do not have permission to access this order", HttpStatus.FORBIDDEN),
    INVALID_ORDER_SOURCE(1707, "Provide either bookId or cartItemIds, not both or neither", HttpStatus.BAD_REQUEST),

    // ==========================
    // CART
    // ==========================
    CART_NOT_FOUND(1800, "Cart not found", HttpStatus.NOT_FOUND),
    CART_EMPTY(1801, "Cart is empty", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(1802, "Cart item not found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_OWNED(1803, "Cart item does not belong to your cart", HttpStatus.FORBIDDEN),

    // ==========================
    // PAYMENT (VNPAY)
    // ==========================
    VNPAY_PAYMENT_FAILED(1900, "VNPay payment failed or was cancelled", HttpStatus.BAD_REQUEST),
    VNPAY_INVALID_SIGNATURE(1901, "Invalid VNPay signature", HttpStatus.BAD_REQUEST),

    // ==========================
    // RATING & COMMENT
    // ==========================
    RATING_NOT_FOUND(2000, "Rating not found", HttpStatus.NOT_FOUND),
    RATING_ALREADY_EXISTS(2001, "You have already rated this book", HttpStatus.CONFLICT),
    RATING_NOT_PURCHASED(2002, "You can only rate purchased books", HttpStatus.FORBIDDEN),
    INVALID_RATING_VALUE(2003, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),

    COMMENT_NOT_FOUND(2004, "Comment not found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_OWNED(2005, "You do not have permission to delete this comment", HttpStatus.FORBIDDEN),
    COMMENT_NOT_PURCHASED(2006, "You can only comment on purchased books", HttpStatus.FORBIDDEN),
    COMMENT_PARENT_NOT_FOUND(2007, "Parent comment not found", HttpStatus.NOT_FOUND),
    COMMENT_PARENT_BOOK_MISMATCH(2008, "Parent comment does not belong to this book", HttpStatus.BAD_REQUEST),
    COMMENT_CONTENT_BLANK(2009, "Comment content must not be blank", HttpStatus.BAD_REQUEST),

    // ==========================
    // NOTIFICATION
    // ==========================
    NOTIFICATION_NOT_FOUND(2100, "Notification not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_ALREADY_SENT(2101, "Notification has already been sent", HttpStatus.BAD_REQUEST),
    NOTIFICATION_CANNOT_BE_CANCELLED(2102, "Only draft or scheduled notifications can be cancelled", HttpStatus.BAD_REQUEST),
    NOTIFICATION_INVALID_AUDIENCE(2103, "Invalid notification audience", HttpStatus.BAD_REQUEST),
    USER_NOTIFICATION_NOT_FOUND(2104, "User notification not found", HttpStatus.NOT_FOUND),
    ;

    int code;
    String message;
    HttpStatusCode statusCode;
}