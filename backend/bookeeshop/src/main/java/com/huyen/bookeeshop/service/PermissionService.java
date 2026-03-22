package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.RolePermissionUpdateRequest;
import com.huyen.bookeeshop.dto.response.PermissionResponse;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.entity.Permission;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.PermissionMapper;
import com.huyen.bookeeshop.mapper.RoleMapper;
import com.huyen.bookeeshop.repository.PermissionRepository;
import com.huyen.bookeeshop.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {

    PermissionRepository permissionRepository;
    RoleRepository       roleRepository;
    PermissionMapper     permissionMapper;
    RoleMapper           roleMapper;

    /**
     * 1. ADMIN - Get all permissions in the system
     */
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {
        return permissionRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(p -> p.getName() == null ? "" : p.getName()))
                .map(permissionMapper::toPermissionResponse)
                .toList();
    }

    /**
     * 2. ADMIN - Set permissions for a role
     */
    @Transactional
    public RoleResponse setRolePermissions(UUID roleId, RolePermissionUpdateRequest request) {
        Role role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        List<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds());

        if (permissions.size() != request.getPermissionIds().size()) {
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }

        role.setPermissions(new HashSet<>(permissions));
        roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }
}