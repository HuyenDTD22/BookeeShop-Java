package com.huyen.bookeeshop.constant;

import lombok.Getter;

@Getter
public enum PredefinedRole {
    USER_ROLE("USER", "Khách hàng"),
    ADMIN_ROLE("ADMIN", "Quản trị viên");

    private final String name;
    private final String displayName;

    PredefinedRole(String name, String displayName) {
        this.name = name;
        this.displayName = displayName;
    }
}
