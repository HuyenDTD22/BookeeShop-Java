package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.configuration.DefaultAdminProperties;
import com.huyen.bookeeshop.constant.PredefinedPermission;
import com.huyen.bookeeshop.constant.PredefinedRole;
import com.huyen.bookeeshop.constant.RolePermissionMapping;
import com.huyen.bookeeshop.entity.Permission;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.repository.PermissionRepository;
import com.huyen.bookeeshop.repository.RoleRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class InitService {

    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    DefaultAdminProperties defaultAdminProperties;

    @Transactional
    public void init() {
        log.info("Starting system initialization...");
        syncPermissions();
        syncRoles();
        syncRolePermissions();
        createDefaultAdmin();
        log.info("Starting system initialization...");
    }

    // 1. Sync Permissions
    private void syncPermissions() {
        for(String permissionName : PredefinedPermission.getAllPermissions()) {
            if(!permissionRepository.existsByName(permissionName)) {
                Permission permission = Permission.builder()
                        .name(permissionName)
                        .build();

                permissionRepository.save(permission);
                log.info("Inserted permission: {}", permissionName);
            }
        }
    }

    // 2. Sync Roles
    private void syncRoles() {
        for(String roleName : PredefinedRole.getAllRoles()) {
            if(!roleRepository.existsByName(roleName)) {
                Role role = Role.builder()
                        .name(roleName)
                        .deleted(false)
                        .build();

                roleRepository.save(role);
                log.info("Inserted role: {}", roleName);
            }
        }
    }

    // 3. Sync Role-Permission Mapping
    private void syncRolePermissions() {
        Map<String, List<String>> rolePermissionMap = RolePermissionMapping.getRolePermissions();

        for(Map.Entry<String, List<String>> entry : rolePermissionMap.entrySet()) {
            String roleName = entry.getKey();
            List<String> permissionNames = entry.getValue();

            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

            Set<Permission> permissions = permissionNames.stream()
                    .map(name -> permissionRepository.findByName(name)
                            .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND)))
                    .collect(Collectors.toSet());

            role.setPermissions(permissions);
            roleRepository.save(role);

            log.info("Updated permissions for role: {}", roleName);
        }
    }

    // 4. Create default admin account
    private void createDefaultAdmin() {
        String username = defaultAdminProperties.getUsername();
        String password = defaultAdminProperties.getPassword();

        Role adminRole = roleRepository.findByName(PredefinedRole.ADMIN_ROLE)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .roles(Set.of(adminRole))
                    .deleted(false)
                    .build();

            userRepository.save(user);
            log.warn("Default admin account created. Please change the password immediately.");
        }
    }
}