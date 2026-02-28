package com.huyen.bookeeshop.controller.client;

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
                .message("Tạo tài khoản thành công!")
                .result(userService.registerCustomer(request))
                .build();
    }

    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping("/me")
    ApiResponse<UserResponse> updateUser(@RequestBody @Valid CustomerUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .message("Chỉnh sửa thông tin thành công ")
                .result(userService.updateMyProfile(request))
                .build();
    }
}
