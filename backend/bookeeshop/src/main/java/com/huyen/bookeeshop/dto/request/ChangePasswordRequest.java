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
public class ChangePasswordRequest {

    @NotBlank
    String oldPassword;

    @NotBlank
    @Size(min = 8, max = 100, message = "PASSWORD_INVALID")
    String newPassword;
}