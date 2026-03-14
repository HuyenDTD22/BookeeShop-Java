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
    ;

    int code;
    String message;
    HttpStatusCode statusCode;
}
