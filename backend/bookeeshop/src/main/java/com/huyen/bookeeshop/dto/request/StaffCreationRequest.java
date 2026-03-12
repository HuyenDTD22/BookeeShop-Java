package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.validator.DobConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffCreationRequest {
    @NotBlank
    @Size(min = 3, max = 50, message = "USERNAME_INVALID")
    String username;

    @NotBlank
    @Size(min = 8, max = 100, message = "PASSWORD_INVALID")
    String password;

    @NotBlank
    @Size(max = 100)
    String fullName;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;

    @NotBlank
    String gender;

    @NotBlank
    @Pattern(regexp = "^\\d{10,11}$", message = "PHONE_INVALID")
    String phone;

    @NotBlank
    String address;

    @NotEmpty
    Set<UUID> roles;
}
