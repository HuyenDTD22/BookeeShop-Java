package com.huyen.bookeeshop.controller.auth;

import com.huyen.bookeeshop.dto.request.ForgotPasswordRequest;
import com.huyen.bookeeshop.dto.request.ResetPasswordRequest;
import com.huyen.bookeeshop.dto.request.VerifyOtpRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.service.ForgotPasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@Tag(name = "ForgotPassword", description = "ForgotPassword APIs for client")
@RestController
@RequestMapping("/auth/forgot-password")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ForgotPasswordController {

    ForgotPasswordService forgotPasswordService;

    @Operation(summary = "Send OTP to user's email for password reset")
    @PostMapping
    public ApiResponse<Void> sendOtp(@RequestBody @Valid ForgotPasswordRequest request) {
        forgotPasswordService.sendOtp(request);
        return ApiResponse.<Void>builder()
                .message("OTP has been sent to your email")
                .build();
    }

    @Operation(summary = "Verify OTP for password reset")
    @PostMapping("/verify")
    public ApiResponse<Void> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        forgotPasswordService.verifyOtp(request);
        return ApiResponse.<Void>builder()
                .message("OTP is valid")
                .build();
    }

    @Operation(summary = "Reset password using valid OTP")
    @PostMapping("/reset")
    public ApiResponse<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        forgotPasswordService.resetPassword(request);
        return ApiResponse.<Void>builder()
                .message("Password has been reset successfully")
                .build();
    }
}