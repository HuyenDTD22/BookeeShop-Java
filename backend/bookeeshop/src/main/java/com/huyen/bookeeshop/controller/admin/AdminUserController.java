package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.CustomerFilterRequest;
import com.huyen.bookeeshop.dto.request.StaffCreationRequest;
import com.huyen.bookeeshop.dto.request.StaffFilterRequest;
import com.huyen.bookeeshop.dto.request.StaffUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.CustomerResponse;
import com.huyen.bookeeshop.dto.response.StaffResponse;
import com.huyen.bookeeshop.dto.response.UserResponse;
import com.huyen.bookeeshop.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("${app.admin-prefix}/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminUserController {

    UserService userService;

    //==========================================================================
    // STAFF MANAGEMENT
    //==========================================================================

    @PostMapping(value = "/staff", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('STAFF_CREATE')")
    ApiResponse<UserResponse> createStaff(@RequestPart("data") @Valid StaffCreationRequest request,
                                          @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createStaff(request, avatar))
                .build();
    }

    @PutMapping(value = "/staff/{userId}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('STAFF_UPDATE')")
    ApiResponse<UserResponse> updateStaff(@PathVariable UUID userId,
                                          @RequestPart("data") StaffUpdateRequest request,
                                          @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateStaff(userId, request, avatar))
                .build();
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAuthority('STAFF_LIST_VIEW')")
    ApiResponse<Page<StaffResponse>> getStaffs(@ModelAttribute StaffFilterRequest filter) {
        return ApiResponse.<Page<StaffResponse>>builder()
                .result(userService.getStaffs(filter))
                .build();
    }

    @GetMapping("/staff/{userId}")
    @PreAuthorize("hasAuthority('STAFF_VIEW')")
    ApiResponse<UserResponse> getStaff(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @GetMapping("/staff/myInfo")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @DeleteMapping("/staff/{userId}")
    @PreAuthorize("hasAuthority('STAFF_DELETE')")
    ApiResponse<String> deleteStaff(@PathVariable UUID userId) {
        userService.deleteUser(userId);

        return ApiResponse.<String>builder()
                .result("Staff has been deleted")
                .build();
    }

    @PatchMapping("/staff/{userId}/toggle-lock")
    @PreAuthorize("hasAuthority('STAFF_UPDATE')")
    ApiResponse<UserResponse> toggleLockStaff(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.toggleLock(userId))
                .build();
    }

    //==========================================================================
    // CUSTOMER MANAGEMENT
    //==========================================================================

    @GetMapping("/customer")
    @PreAuthorize("hasAuthority('CUSTOMER_LIST_VIEW')")
    ApiResponse<Page<CustomerResponse>> getCustomers(@ModelAttribute CustomerFilterRequest filter) {
        return ApiResponse.<Page<CustomerResponse>>builder()
                .result(userService.getCustomers(filter))
                .build();
    }

    @GetMapping("/customer/{userId}")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    ApiResponse<UserResponse> getCustomner(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @PatchMapping("/customer/{userId}/toggle-lock")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    ApiResponse<UserResponse> toggleLockCustomer(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.toggleLock(userId))
                .build();
    }

    @DeleteMapping("/customer/{userId}")
    @PreAuthorize("hasAuthority('CUSTOMER_DELETE')")
    ApiResponse<String> deleteCustomer(@PathVariable UUID userId) {
        userService.deleteUser(userId);

        return ApiResponse.<String>builder()
                .result("Customer has been deleted")
                .build();
    }
}
