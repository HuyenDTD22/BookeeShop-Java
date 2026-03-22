package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    String username;

    @NotBlank(message = "OTP is required")
    String otp;

    @NotBlank
    @Size(min = 8, max = 100, message = "PASSWORD_INVALID")
    String newPassword;
}