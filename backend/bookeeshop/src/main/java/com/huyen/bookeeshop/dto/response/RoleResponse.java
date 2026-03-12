package com.huyen.bookeeshop.dto.response;

import java.util.Set;
import java.util.UUID;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    UUID id;
    String name;
    String displayName;
    Set<PermissionResponse> permissions;
}
