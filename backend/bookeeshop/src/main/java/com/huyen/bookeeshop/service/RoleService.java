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

    public RoleResponse create(RoleCreationRequest request) {
        var role = roleMapper.toRole(request);

        try {
            role = roleRepository.save(role);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        return roleMapper.toRoleResponse(role);
    }

    public RoleResponse update(UUID roleId, RoleUpdateRequest request)  {
        var role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        roleMapper.updateRole(role, request);

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

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

    public void delete(UUID roleId) {
        Role role = roleRepository.findByIdAndDeletedFalse(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        role.setDeleted(true);

        roleRepository.save(role);
    }
}
