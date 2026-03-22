package com.huyen.bookeeshop.service;

import java.util.List;
import java.util.UUID;

import com.huyen.bookeeshop.dto.request.RoleCreationRequest;
import com.huyen.bookeeshop.dto.request.RoleUpdateRequest;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.RoleMapper;
import com.huyen.bookeeshop.repository.RoleRepository;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;

    /**
     * 1. ADMIN - Create a new role
     */
    @Transactional
    public RoleResponse create(RoleCreationRequest request) {
        String roleName = request.getName().trim().toUpperCase();

        if (!roleName.startsWith("STAFF_")) {
            roleName = "STAFF_" + roleName;
        }

        if(roleRepository.existsByNameAndDeletedFalse(roleName)) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        var role = roleMapper.toRole(request);
        role.setName(roleName);

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    /**
     * 2. ADMIN - Update information of a role
     */
    @Transactional
    public RoleResponse update(UUID roleId, RoleUpdateRequest request)  {
        var role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        String roleName = request.getName().trim().toUpperCase();

        if (!roleName.startsWith("STAFF_")) {
            roleName = "STAFF_" + roleName;
        }

        if(roleRepository.existsByNameAndDeletedFalse(roleName)) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        roleMapper.updateRole(role, request);

        if(!role.getName().equals(roleName)) {
            role.setName(roleName);
        }

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    /**
     * 3. ADMIN - Get all roles in the system
     */
    @Transactional(readOnly = true)
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

    /**
     * 4. ADMIN - Delete a role by ID (soft delete)
     */
    @Transactional
    public void delete(UUID roleId) {
        Role role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        role.setDeleted(true);

        roleRepository.save(role);
    }
}
