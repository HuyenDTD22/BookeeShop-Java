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
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1009, "Role not found", HttpStatus.NOT_FOUND),
    PHONE_INVALID(1010, "Invalid phone", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_FOUND(1011, "Permission not found", HttpStatus.NOT_FOUND),
    INVALID_ROLE_ASSIGNMENT(1012, "Can not assign sensitive roles to staff", HttpStatus.BAD_REQUEST),
    ROLE_EXISTED(1013, "Role existed", HttpStatus.BAD_REQUEST),
    BOOK_EXISTED(1014, "Book existed", HttpStatus.BAD_REQUEST),
    BOOK_NOT_FOUND(1015, "Role not found", HttpStatus.NOT_FOUND),
    CATEGORY_EXISTED(1016, "Category existed", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1017, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_CIRCULAR_REFERENCE(1018, "Category circular reference", HttpStatus.BAD_REQUEST),
    CATEGORY_HAS_CHILDREN(1019, "Category has children", HttpStatus.CONFLICT),
    CATEGORY_HAS_BOOKS(1020, "Category has books", HttpStatus.CONFLICT),
    ORDER_NOT_FOUND(1021, "Order not found", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_DELETED(1022, "Order has already been deleted", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_MODIFIED(1023, "Order cannot be modified in its current status", HttpStatus.BAD_REQUEST),
    ORDER_BULK_UPDATE_FAILED(1024, "Some orders could not be updated", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS_TRANSITION(1025, "Invalid order status transition", HttpStatus.BAD_REQUEST),
    INVALID_OLD_PASSWORD(1026, "Old password is incorrect", HttpStatus.BAD_REQUEST),
    CANNOT_DELETE_YOURSELF(1027, "You cannot delete your own account", HttpStatus.BAD_REQUEST),
    CANNOT_LOCK_YOURSELF(1028, "You cannot lock your own account", HttpStatus.BAD_REQUEST),
    CART_NOT_FOUND(1029, "Cart not found", HttpStatus.NOT_FOUND),
    CART_EMPTY(1030, "Cart is empty", HttpStatus.BAD_REQUEST),
    BOOK_OUT_OF_STOCK(1031, "Book is out of stock", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK(1032, "Insufficient stock for book: %s", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELLED(1033, "Order can only be cancelled when status is PENDING", HttpStatus.BAD_REQUEST),
    ORDER_NOT_OWNED(1034, "You do not have permission to access this order", HttpStatus.FORBIDDEN),
    VNPAY_PAYMENT_FAILED(1035, "VNPay payment failed or was cancelled", HttpStatus.BAD_REQUEST),
    VNPAY_INVALID_SIGNATURE(1036, "Invalid VNPay signature", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(1037, "Cart item not found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_OWNED(1038, "Cart item does not belong to your cart", HttpStatus.FORBIDDEN),
    INVALID_ORDER_SOURCE(1039, "Must provide either bookId or cartItemIds, not both or neither", HttpStatus.BAD_REQUEST),
    BOOK_NOT_AVAILABLE(1040, "Book is not available", HttpStatus.BAD_REQUEST),
    QUANTITY_MUST_BE_POSITIVE(1041, "Quantity must be at least 1", HttpStatus.BAD_REQUEST),
    INVALID_NAME_ROLE(1043, "Invalid name", HttpStatus.BAD_REQUEST),
    INVALID_DISPLAY_NAME_ROLE(1044, "Invalid display name", HttpStatus.BAD_REQUEST),
    RATING_NOT_FOUND(1045, "Rating not found", HttpStatus.NOT_FOUND),
    RATING_ALREADY_EXISTS(1046, "You have already rated this book", HttpStatus.CONFLICT),
    RATING_NOT_PURCHASED(1047, "You can only rate books you have purchased and received", HttpStatus.FORBIDDEN),
    INVALID_RATING_VALUE(1048, "Rating value must be an integer between 1 and 5", HttpStatus.BAD_REQUEST),
    COMMENT_NOT_FOUND(1049, "Comment not found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_OWNED(1050, "You do not have permission to delete this comment", HttpStatus.FORBIDDEN),
    COMMENT_NOT_PURCHASED(1051, "You can only comment on books you have purchased and received", HttpStatus.FORBIDDEN),
    COMMENT_PARENT_NOT_FOUND(1052, "Parent comment not found", HttpStatus.NOT_FOUND),
    COMMENT_PARENT_BOOK_MISMATCH(1053, "Parent comment does not belong to this book", HttpStatus.BAD_REQUEST),
    COMMENT_CONTENT_BLANK(1054, "Comment content must not be blank", HttpStatus.BAD_REQUEST),
    NOTIFICATION_NOT_FOUND(1055, "Notification not found", HttpStatus.NOT_FOUND),
    NOTIFICATION_ALREADY_SENT(1056, "Cannot modify a notification that has already been sent", HttpStatus.BAD_REQUEST),
    NOTIFICATION_CANNOT_BE_CANCELLED(1057, "Only DRAFT or SCHEDULED notifications can be cancelled", HttpStatus.BAD_REQUEST),
    NOTIFICATION_INVALID_AUDIENCE(1058, "Invalid audience configuration", HttpStatus.BAD_REQUEST),
    USER_NOTIFICATION_NOT_FOUND(1059, "User notification record not found", HttpStatus.NOT_FOUND),
    ;

    int code;
    String message;
    HttpStatusCode statusCode;
}
