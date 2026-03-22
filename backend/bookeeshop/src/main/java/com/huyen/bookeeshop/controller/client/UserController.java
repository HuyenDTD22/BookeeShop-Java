package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.ChangePasswordRequest;
import com.huyen.bookeeshop.dto.request.CustomerCreationRequest;
import com.huyen.bookeeshop.dto.request.UserUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.UserResponse;
import com.huyen.bookeeshop.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "User", description = "User APIs for client")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    @Operation(summary = "Register a new customer")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<UserResponse> registerCustomer(@RequestBody @Valid CustomerCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Create user success!")
                .result(userService.registerCustomer(request))
                .build();
    }

    @Operation(summary = "Get current user's information")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @Operation(summary = "Update current user's profile")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(value = "/me", consumes = "multipart/form-data")
    ApiResponse<UserResponse> updateMyProfile(@RequestPart("data") @Valid UserUpdateRequest request,
                                              @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .message("Update information success!")
                .result(userService.updateMyProfile(request, avatar))
                .build();
    }

    @Operation(summary = "Change current user's password")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/me/password")
    ApiResponse<String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<String>builder()
                .message("Password changed successfully")
                .build();
    }
}
