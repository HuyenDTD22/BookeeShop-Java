package com.huyen.bookeeshop.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.huyen.bookeeshop.constant.PredefinedRole;
import com.huyen.bookeeshop.dto.request.CustomerCreationRequest;
import com.huyen.bookeeshop.dto.request.CustomerUpdateRequest;
import com.huyen.bookeeshop.dto.request.StaffCreationRequest;
import com.huyen.bookeeshop.dto.request.StaffUpdateRequest;
import com.huyen.bookeeshop.dto.response.CustomerResponse;
import com.huyen.bookeeshop.dto.response.StaffResponse;
import com.huyen.bookeeshop.dto.response.UserResponse;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.UserMapper;
import com.huyen.bookeeshop.repository.RoleRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    CloudinaryService cloudinaryService;

    @Transactional
    public UserResponse registerCustomer(CustomerCreationRequest request) {
        User user = userMapper.toCustomer(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role = roleRepository.findByNameAndDeletedFalse(PredefinedRole.USER_ROLE.getName())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        user.setRoles(Set.of(role));

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsernameAndDeletedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateMyProfile(CustomerUpdateRequest request, MultipartFile avatar) {
        String username = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByUsernameAndDeletedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateCustomer(user, request);

        if(request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if(avatar != null && !avatar.isEmpty()){
            String avatarUrl = cloudinaryService.uploadFile(avatar);
            user.setAvatar(avatarUrl);
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse createStaff(StaffCreationRequest request, MultipartFile avatar) {
        User user = userMapper.toStaff(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = roleRepository.findAllByIdInAndDeletedFalse(request.getRoles());

        if(roles.size() != request.getRoles().size()) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        boolean hasAdminRole = roles.stream()
                        .anyMatch(role -> role.getName().equals(PredefinedRole.ADMIN_ROLE.getName()));

        if(hasAdminRole) {
            throw new AppException(ErrorCode.INVALID_ROLE_ASSIGNMENT);
        }

        user.setRoles(roles);

        if(avatar != null && !avatar.isEmpty()){
            String avatarUrl = cloudinaryService.uploadFile(avatar);
            user.setAvatar(avatarUrl);
        }

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateStaff(UUID userId, StaffUpdateRequest request, MultipartFile avatar) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateStaff(user, request);

        if(request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if(request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = roleRepository.findAllByIdInAndDeletedFalse(request.getRoles()).stream()
                            .filter(role -> !role.getName().equals(PredefinedRole.ADMIN_ROLE.getName()))
                            .collect(Collectors.toSet());

            if(roles.isEmpty()) {
                throw new AppException(ErrorCode.ROLE_NOT_FOUND);
            }

            user.setRoles(roles);
        }

        if(avatar != null && !avatar.isEmpty()){
            String avatarUrl = cloudinaryService.uploadFile(avatar);
            user.setAvatar(avatarUrl);
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public List<StaffResponse> getStaffs() {
        try {
            return userRepository.findAllByDeletedFalse().stream()
                    .filter(user -> user.getRoles() != null && user.getRoles()
                            .stream()
                            .map(Role::getName)
                            .anyMatch(roleName -> roleName != null && roleName.startsWith("STAFF_")))
                    .map(userMapper::toStaffResponse)
                    .toList();
        } catch (Exception e) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    public List<CustomerResponse> getCustomers() {
        try {
            return userRepository.findAllByDeletedFalse().stream()
                    .filter(user -> user.getRoles() != null && user.getRoles()
                            .stream()
                            .map(Role::getName)
                            .anyMatch(roleName -> roleName != null && roleName.equals(PredefinedRole.USER_ROLE.getName())))
                    .map(userMapper::toCustomerResponse).toList();
        } catch (Exception e) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    public UserResponse getUser(UUID userId) {
        return userMapper.toUserResponse(
                userRepository.findByIdAndDeletedFalse(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    public void deleteUser(UUID userId) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setDeleted(true);

        userRepository.save(user);
    }
}
