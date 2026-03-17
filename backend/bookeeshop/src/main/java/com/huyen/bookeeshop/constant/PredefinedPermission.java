package com.huyen.bookeeshop.constant;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PredefinedPermission {
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_VIEW = "USER_VIEW";
    public static final String USER_DELETE = "USER_DELETE";

    public static final String CUSTOMER_CREATE = "CUSTOMER_CREATE";
    public static final String CUSTOMER_UPDATE = "CUSTOMER_UPDATE";
    public static final String CUSTOMER_LIST_VIEW = "CUSTOMER_LIST_VIEW";
    public static final String CUSTOMER_VIEW = "CUSTOMER_VIEW";
    public static final String CUSTOMER_DELETE = "CUSTOMER_DELETE";

    public static final String STAFF_CREATE = "STAFF_CREATE";
    public static final String STAFF_UPDATE = "STAFF_UPDATE";
    public static final String STAFF_LIST_VIEW = "STAFF_LIST_VIEW";
    public static final String STAFF_VIEW = "STAFF_VIEW";
    public static final String STAFF_DELETE = "STAFF_DELETE";

    public static final String ROLE_CREATE = "ROLE_CREATE";
    public static final String ROLE_UPDATE = "ROLE_UPDATE";
    public static final String ROLE_LIST_VIEW = "ROLE_LIST_VIEW";
    public static final String ROLE_VIEW = "ROLE_VIEW";
    public static final String ROLE_DELETE = "ROLE_DELETE";

    public static final String BOOK_CREATE = "BOOK_CREATE";
    public static final String BOOK_UPDATE = "BOOK_UPDATE";
    public static final String BOOK_LIST_VIEW = "BOOK_LIST_VIEW";
    public static final String BOOK_VIEW = "BOOK_VIEW";
    public static final String BOOK_DELETE = "BOOK_DELETE";

    public static final String CATEGORY_CREATE = "CATEGORY_CREATE";
    public static final String CATEGORY_UPDATE = "CATEGORY_UPDATE";
    public static final String CATEGORY_LIST_VIEW = "CATEGORY_LIST_VIEW";
    public static final String CATEGORY_VIEW = "CATEGORY_VIEW";
    public static final String CATEGORY_DELETE = "CATEGORY_DELETE";

    public static final String ORDER_APPROVE = "ORDER_APPROVE";
    public static final String ORDER_UPDATE = "ORDER_UPDATE";
    public static final String ORDER_LIST_VIEW = "ORDER_LIST_VIEW";
    public static final String ORDER_VIEW = "ORDER_VIEW";
    public static final String ORDER_DELETE = "ORDER_DELETE";

    public static final String RATING_VIEW = "RATING_VIEW";

    public static final String COMMENT_LIST_VIEW = "COMMENT_LIST_VIEW";
    public static final String COMMENT_REPLY = "COMMENT_REPLY";
    public static final String COMMENT_DELETE = "COMMENT_DELETE";

    public static final String NOTIFICATION_CREATE = "NOTIFICATION_CREATE";
    public static final String NOTIFICATION_UPDATE = "NOTIFICATION_UPDATE";
    public static final String NOTIFICATION_LIST_VIEW = "NOTIFICATION_LIST_VIEW";
    public static final String NOTIFICATION_VIEW = "NOTIFICATION_VIEW";
    public static final String NOTIFICATION_DELETE = "NOTIFICATION_DELETE";
    public static final String NOTIFICATION_CANCEL = "NOTIFICATION_CANCEL";

    public static List<String> getAllPermissions() {
        return List.of(
                USER_CREATE,
                USER_UPDATE,
                USER_VIEW,
                USER_DELETE,
                CUSTOMER_CREATE,
                CUSTOMER_UPDATE,
                CUSTOMER_LIST_VIEW,
                CUSTOMER_VIEW,
                CUSTOMER_DELETE,
                STAFF_CREATE,
                STAFF_UPDATE,
                STAFF_LIST_VIEW,
                STAFF_VIEW,
                STAFF_DELETE,
                ROLE_CREATE,
                ROLE_UPDATE,
                ROLE_LIST_VIEW,
                ROLE_VIEW,
                ROLE_DELETE,
                BOOK_CREATE,
                BOOK_UPDATE,
                BOOK_LIST_VIEW,
                BOOK_VIEW,
                BOOK_DELETE,
                CATEGORY_CREATE,
                CATEGORY_UPDATE,
                CATEGORY_LIST_VIEW,
                CATEGORY_VIEW,
                CATEGORY_DELETE,
                ORDER_APPROVE,
                ORDER_UPDATE,
                ORDER_LIST_VIEW,
                ORDER_VIEW,
                ORDER_DELETE,
                RATING_VIEW,
                COMMENT_LIST_VIEW,
                COMMENT_REPLY,
                COMMENT_DELETE,
                NOTIFICATION_CREATE,
                NOTIFICATION_UPDATE,
                NOTIFICATION_LIST_VIEW,
                NOTIFICATION_VIEW,
                NOTIFICATION_DELETE,
                NOTIFICATION_CANCEL
        );
    }
}
