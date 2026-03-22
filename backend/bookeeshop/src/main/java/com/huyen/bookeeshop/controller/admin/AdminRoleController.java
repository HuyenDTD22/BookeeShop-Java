package com.huyen.bookeeshop.controller.admin;

import java.util.List;
import java.util.UUID;

import com.huyen.bookeeshop.dto.request.RoleCreationRequest;
import com.huyen.bookeeshop.dto.request.RoleUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Role", description = "Role APIs for admin")
@RestController
@RequestMapping("${app.admin-prefix}/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminRoleController {

    RoleService roleService;

    @Operation(summary = "Create a new role")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<RoleResponse> create(@RequestBody @Valid RoleCreationRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();
    }

    @Operation(summary = "Update information of a role")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<RoleResponse> update(@PathVariable UUID roleId, @RequestBody @Valid RoleUpdateRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.update(roleId, request))
                .build();
    }

    @Operation(summary = "Get all roles in the system")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @Operation(summary = "Delete a role by ID")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> delete(@PathVariable UUID roleId) {
        roleService.delete(roleId);

        return ApiResponse.<String>builder()
                .result("Role has been deleted")
                .build();
    }
}
