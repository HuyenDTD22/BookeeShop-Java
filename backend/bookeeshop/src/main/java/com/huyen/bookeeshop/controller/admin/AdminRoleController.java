package com.huyen.bookeeshop.controller.admin;

import java.util.List;
import java.util.UUID;

import com.huyen.bookeeshop.dto.request.RoleCreationRequest;
import com.huyen.bookeeshop.dto.request.RoleUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.service.RoleService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("${app.admin-prefix}/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminRoleController {

    RoleService roleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<RoleResponse> create(@RequestBody RoleCreationRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<RoleResponse> update(@PathVariable UUID roleId, @RequestBody @Valid RoleUpdateRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.update(roleId, request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<String> delete(@PathVariable UUID roleId) {
        roleService.delete(roleId);

        return ApiResponse.<String>builder()
                .result("Role has been deleted")
                .build();
    }
}
