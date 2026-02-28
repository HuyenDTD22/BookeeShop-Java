package com.huyen.bookeeshop.constant;

import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@NoArgsConstructor
public class RolePermissionMapping {

    public static Map<String, List<String>> getRolePermissions() {
        return Map.of(

                // ADMIN có tất cả các quyền
                PredefinedRole.ADMIN_ROLE,
                PredefinedPermission.getAllPermissions(),

                // USER chỉ có quyền cơ bản
                PredefinedRole.USER_ROLE,
                List.of(
                        PredefinedPermission.BOOK_VIEW
                )
        );
    }
}
