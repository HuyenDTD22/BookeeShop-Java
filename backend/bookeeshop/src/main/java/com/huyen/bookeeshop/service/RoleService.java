package com.huyen.bookeeshop.service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import com.huyen.bookeeshop.dto.request.RoleCreationRequest;
import com.huyen.bookeeshop.dto.request.RolePermissionUpdateRequest;
import com.huyen.bookeeshop.dto.request.RoleUpdateRequest;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.RoleMapper;
import com.huyen.bookeeshop.repository.PermissionRepository;
import com.huyen.bookeeshop.repository.RoleRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionRepository permissionRepository;

    // 1. ADMIN - Tạo mới 1 role
    public RoleResponse create(RoleCreationRequest request) {
        String roleName = request.getName().trim().toUpperCase();

        if (!roleName.startsWith("STAFF_")) {
            roleName = "STAFF_" + roleName;
        }

        var role = roleMapper.toRole(request);
        role.setName(roleName);

        try {
            role = roleRepository.save(role);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        return roleMapper.toRoleResponse(role);
    }

    // 2. ADMIN - Cập nhật thông tin role
    public RoleResponse update(UUID roleId, RoleUpdateRequest request)  {
        var role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String roleName = request.getName().trim().toUpperCase();

        if (!roleName.startsWith("STAFF_")) {
            roleName = "STAFF_" + roleName;
        }

        roleMapper.updateRole(role, request);

        if(!role.getName().equals(roleName)) {
            role.setName(roleName);
        }

        try {
            role = roleRepository.save(role);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        return roleMapper.toRoleResponse(role);
    }

    // 3. ADMIN - Lấy thông tin tất cả role
    public List<RoleResponse> getAll() {
        try {
            return roleRepository.findAllByDeletedFalse()
                    .stream()
                    .map(roleMapper::toRoleResponse)
                    .toList();

        } catch (Exception e) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
    }

    // 4. ADMIN - Xóa role (soft delete)
    public void delete(UUID roleId) {
        Role role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        role.setDeleted(true);

        roleRepository.save(role);
    }

    // 5. ADMIN - Gán permissions cho role
    public RoleResponse setPermissions(UUID roleId, RolePermissionUpdateRequest request) {

        Role role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        var permissions = permissionRepository.findAllById(request.getPermissionIds());

        if (permissions.size() != request.getPermissionIds().size()) {
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        role.setPermissions(new HashSet<>(permissions));

        roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }
}
