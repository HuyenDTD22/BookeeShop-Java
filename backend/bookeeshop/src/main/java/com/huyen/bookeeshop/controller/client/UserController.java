package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.ChangePasswordRequest;
import com.huyen.bookeeshop.dto.request.CustomerCreationRequest;
import com.huyen.bookeeshop.dto.request.CustomerUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.UserResponse;
import com.huyen.bookeeshop.service.UserService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<UserResponse> registerCustomer(@RequestBody @Valid CustomerCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Create user success!")
                .result(userService.registerCustomer(request))
                .build();
    }

    @GetMapping("/me")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping(value = "/me", consumes = "multipart/form-data")
    ApiResponse<UserResponse> updateMyProfile(@RequestPart("data") @Valid CustomerUpdateRequest request,
                                              @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        return ApiResponse.<UserResponse>builder()
                .message("Update information success!")
                .result(userService.updateMyProfile(request, avatar))
                .build();
    }

    @PatchMapping("/me/password")
    ApiResponse<String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<String>builder()
                .message("Password changed successfully")
                .build();
    }
}
