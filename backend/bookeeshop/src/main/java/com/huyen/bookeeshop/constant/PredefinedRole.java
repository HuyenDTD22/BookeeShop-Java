package com.huyen.bookeeshop.constant;

import java.util.List;

public class PredefinedRole {
    public static final String USER_ROLE = "USER";
    public static final String ADMIN_ROLE = "ADMIN";

    private PredefinedRole() {}

    public static List<String> getAllRoles() {
        return List.of(
                USER_ROLE,
                ADMIN_ROLE
        );
    }
}
