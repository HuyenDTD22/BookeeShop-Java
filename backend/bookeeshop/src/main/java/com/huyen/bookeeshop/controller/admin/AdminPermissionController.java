package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.RolePermissionUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.PermissionResponse;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Permission", description = "Permission APIs for admin")
@RestController
@RequestMapping("${app.admin-prefix}/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminPermissionController {

    PermissionService permissionService;

    @Operation(summary = "Get all permissions")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionService.getAll())
                .build();
    }

    @Operation(summary = "Set permissions for a role")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<RoleResponse> setRolePermissions(
            @PathVariable UUID roleId,
            @RequestBody RolePermissionUpdateRequest request) {

        return ApiResponse.<RoleResponse>builder()
                .result(permissionService.setRolePermissions(roleId, request))
                .build();
    }
}