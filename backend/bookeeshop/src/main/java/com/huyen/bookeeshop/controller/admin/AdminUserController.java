package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.*;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.CustomerResponse;
import com.huyen.bookeeshop.dto.response.StaffResponse;
import com.huyen.bookeeshop.dto.response.UserResponse;
import com.huyen.bookeeshop.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "User", description = "User APIs for admin")
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

    @Operation(summary = "Create a new staff member")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(value = "/staff", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('STAFF_CREATE')")
    ApiResponse<UserResponse> createStaff(@RequestPart("data") @Valid StaffCreationRequest request,
                                          @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createStaff(request, avatar))
                .build();
    }

    @Operation(summary = "Update an existing staff member's information")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(value = "/staff/{userId}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('STAFF_UPDATE')")
    ApiResponse<UserResponse> updateStaff(@PathVariable UUID userId,
                                          @RequestPart("data") @Valid StaffUpdateRequest request,
                                          @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateStaff(userId, request, avatar))
                .build();
    }

    @Operation(summary = "Get list of staff members")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/staff")
    @PreAuthorize("hasAuthority('STAFF_LIST_VIEW')")
    ApiResponse<Page<StaffResponse>> getStaffs(@ModelAttribute StaffFilterRequest filter) {
        return ApiResponse.<Page<StaffResponse>>builder()
                .result(userService.getStaffs(filter))
                .build();
    }

    @Operation(summary = "Get a staff member's information by their ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/staff/{userId}")
    @PreAuthorize("hasAuthority('STAFF_VIEW')")
    ApiResponse<UserResponse> getStaff(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @Operation(summary = "Get current staff member's information")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @Operation(summary = "Update current staff member's profile")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(value = "/me", consumes = "multipart/form-data")
    public ApiResponse<UserResponse> updateMyProfile(
            @RequestPart("data") @Valid UserUpdateRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateMyProfile(request, avatar))
                .build();
    }

    @Operation(summary = "Delete a staff member by their ID")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/staff/{userId}")
    @PreAuthorize("hasAuthority('STAFF_DELETE')")
    ApiResponse<String> deleteStaff(@PathVariable UUID userId) {
        userService.deleteUser(userId);

        return ApiResponse.<String>builder()
                .result("Staff has been deleted")
                .build();
    }

    @Operation(summary = "Toggle lock/unlock a staff member's account by their ID")
    @SecurityRequirement(name = "bearerAuth")
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

    @Operation(summary = "Get list of customers")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/customer")
    @PreAuthorize("hasAuthority('CUSTOMER_LIST_VIEW')")
    ApiResponse<Page<CustomerResponse>> getCustomers(@ModelAttribute CustomerFilterRequest filter) {
        return ApiResponse.<Page<CustomerResponse>>builder()
                .result(userService.getCustomers(filter))
                .build();
    }

    @Operation(summary = "Get a customer information by their ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/customer/{userId}")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    ApiResponse<UserResponse> getCustomner(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @Operation(summary = "Toggle lock/unlock a customer account by their ID")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/customer/{userId}/toggle-lock")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    ApiResponse<UserResponse> toggleLockCustomer(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.toggleLock(userId))
                .build();
    }

    @Operation(summary = "Delete a customer by their ID")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/customer/{userId}")
    @PreAuthorize("hasAuthority('CUSTOMER_DELETE')")
    ApiResponse<String> deleteCustomer(@PathVariable UUID userId) {
        userService.deleteUser(userId);

        return ApiResponse.<String>builder()
                .result("Customer has been deleted")
                .build();
    }
}
