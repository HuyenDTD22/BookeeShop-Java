package com.huyen.bookeeshop.service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import com.huyen.bookeeshop.constant.PredefinedRole;
import com.huyen.bookeeshop.dto.request.*;
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
import com.huyen.bookeeshop.specification.UserSpecification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

    //==========================================================================
    // ADMIN APIs
    //==========================================================================

    // 1. ADMIN - Tạo tài khoản nhân viên
    public UserResponse createStaff(StaffCreationRequest request, MultipartFile avatar) {
        User user = userMapper.toStaff(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Set<Role> roles = resolveStaffRoles(request.getRoles());

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

    // 2. ADMIN - Cập nhật thông tin nhân viên
    public UserResponse updateStaff(UUID userId, StaffUpdateRequest request, MultipartFile avatar) {
        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateStaff(user, request);

        if(request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if(request.getRoles() != null && !request.getRoles().isEmpty()) {
            Set<Role> roles = resolveStaffRoles(request.getRoles());
            user.setRoles(roles);
        }

        if(avatar != null && !avatar.isEmpty()){
            String avatarUrl = cloudinaryService.uploadFile(avatar);
            user.setAvatar(avatarUrl);
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // 3. ADMIN - Xem danh sách nhân viên
    public Page<StaffResponse> getStaffs(StaffFilterRequest filter) {
        Specification<User> spec = UserSpecification.staffWithFilter(filter);

        Pageable pageable = buildPageable(filter.getPage(), filter.getSize(),
                filter.getSortBy(), filter.getSortDir());

        return userRepository.findAll(spec, pageable)
                .map(userMapper::toStaffResponse);
    }

    // 4. ADMIN - Xem danh sách khách hàng
    public Page<CustomerResponse> getCustomers(CustomerFilterRequest filter) {
        Specification<User> spec = UserSpecification.customerWithFilter(filter);

        Pageable pageable = buildPageable(filter.getPage(), filter.getSize(),
                filter.getSortBy(), filter.getSortDir());

        return userRepository.findAll(spec, pageable)
                .map(userMapper::toCustomerResponse);
    }

    // 5. ADMIN - Xem chi tiết nhân viên hoặc khách hàng
    public UserResponse getUser(UUID userId) {
        return userMapper.toUserResponse(
                userRepository.findByIdAndDeletedFalse(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    // 6. ADMIN - Xóa tài khoản nhân viên hoặc khách hàng (soft delete)
    public void deleteUser(UUID userId) {
        User userCurrent = userRepository.findByUsernameAndDeletedFalse(getCurrentUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(userCurrent.getId().equals(userId)) {
            throw new AppException(ErrorCode.CANNOT_DELETE_YOURSELF);
        }

        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    // 7. ADMIN - Khóa/Mở khóa tài khoản nhân viên hoặc khách hàng
    public UserResponse toggleLock(UUID userId) {
        User currentUser = userRepository.findByUsernameAndDeletedFalse(getCurrentUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (currentUser.getId().equals(userId)) {
            throw new AppException(ErrorCode.CANNOT_LOCK_YOURSELF);
        }

        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setLocked(!user.getLocked());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Set<Role> resolveStaffRoles(Set<UUID> roleIds) {
        Set<Role> roles = roleRepository.findAllByIdInAndDeletedFalse(roleIds);

        if (roles.size() != roleIds.size()) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }

        // Không cho phép gán role ADMIN_ROLE cho nhân viên
        boolean hasAdminRole = roles.stream()
                .anyMatch(role -> PredefinedRole.ADMIN_ROLE.getName().equals(role.getName()));

        if (hasAdminRole) {
            throw new AppException(ErrorCode.INVALID_ROLE_ASSIGNMENT);
        }

        // Chỉ cho phép gán role có prefix STAFF_
        boolean hasNonStaffRole = roles.stream()
                .anyMatch(role -> !role.getName().startsWith("STAFF_"));

        if (hasNonStaffRole) {
            throw new AppException(ErrorCode.INVALID_ROLE_ASSIGNMENT);
        }

        return roles;
    }

    private Pageable buildPageable(int page, int size, String sortBy, String sortDir) {
        int p = Math.max(page, 0);
        int s = (size > 0 && size <= 100) ? size : 20;

        String sortField = "fullName".equals(sortBy) ? "fullName" : "createdAt";

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        return PageRequest.of(p, s, Sort.by(direction, sortField));
    }

    //==========================================================================
    // CLIENT APIs
    //==========================================================================

    // 1. CLIENT - Khách hàng đăng ký tài khoản
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

    // 2. CLIENT - Xem thông tin cá nhân
    public UserResponse getMyInfo() {
        User user = userRepository.findByUsernameAndDeletedFalseAndLockedFalse(getCurrentUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    // 3. CLIENT - Cập nhật thông tin cá nhân
    public UserResponse updateMyProfile(CustomerUpdateRequest request, MultipartFile avatar) {
        User user = userRepository.findByUsernameAndDeletedFalseAndLockedFalse(getCurrentUsername())
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

    // 4. CLIENT - Đổi mật khẩu
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByUsernameAndDeletedFalseAndLockedFalse(getCurrentUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
