package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.StaffCreationRequest;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("${app.admin-prefix}/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminUserController {

    UserService userService;

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
    ApiResponse<List<StaffResponse>> getStaffs() {
        return ApiResponse.<List<StaffResponse>>builder()
                .result(userService.getStaffs())
                .build();
    }

    @GetMapping("/customer")
    @PreAuthorize("hasAuthority('CUSTOMER_LIST_VIEW')")
    ApiResponse<List<CustomerResponse>> getCustomers() {
        return ApiResponse.<List<CustomerResponse>>builder()
                .result(userService.getCustomers())
                .build();
    }

    @GetMapping("/staff/{userId}")
    @PreAuthorize("hasAuthority('STAFF_VIEW')")
    ApiResponse<UserResponse> getStaff(@PathVariable UUID userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUser(userId))
                .build();
    }

    @GetMapping("/customer/{userId}")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    ApiResponse<UserResponse> getCustomner(@PathVariable UUID userId) {
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

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    ApiResponse<String> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);

        return ApiResponse.<String>builder()
                .result("User has been deleted")
                .build();
    }
}
