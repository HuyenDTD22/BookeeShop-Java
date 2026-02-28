package com.huyen.bookeeshop.constant;

import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
public class PredefinedPermission {
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_VIEW = "USER_VIEW";
    public static final String USER_DELETE = "USER_DELETE";

    public static final String ROLE_CREATE = "ROLE_CREATE";
    public static final String ROLE_UPDATE = "ROLE_UPDATE";
    public static final String ROLE_VIEW = "ROLE_VIEW";
    public static final String ROLE_DELETE = "ROLE_DELETE";

    public static final String BOOK_CREATE = "BOOK_CREATE";
    public static final String BOOK_UPDATE = "BOOK_UPDATE";
    public static final String BOOK_VIEW = "BOOK_VIEW";
    public static final String BOOK_DELETE = "BOOK_DELETE";

    public static List<String> getAllPermissions() {
        return List.of(
                USER_CREATE,
                USER_UPDATE,
                USER_VIEW,
                USER_DELETE,
                ROLE_CREATE,
                ROLE_UPDATE,
                ROLE_VIEW,
                ROLE_DELETE,
                BOOK_CREATE,
                BOOK_UPDATE,
                BOOK_VIEW,
                BOOK_DELETE
        );
    }
}
