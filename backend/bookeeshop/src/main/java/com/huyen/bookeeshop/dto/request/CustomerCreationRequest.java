package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.validator.DobConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreationRequest {
    @NotBlank(message = "USERNAME_REQUIRED")
    @Size(min = 3, max = 50, message = "USERNAME_INVALID")
    String username;

    @NotBlank(message = "PASSWORD_REQUIRED")
    @Size(min = 8, max = 100, message = "PASSWORD_INVALID")
    String password;

    @NotBlank(message = "FULLNAME_REQUIRED")
    @Size(max = 100, message = "FULLNAME_INVALID")
    String fullName;

    @NotNull(message = "INVALID_REQUIRED")
    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;

    @NotBlank(message = "GENDER_REQUIRED")
    String gender;

    @NotBlank(message = "PHONE_REQUIRED")
    @Pattern(regexp = "^\\d{10,11}$", message = "PHONE_INVALID")
    String phone;

    @NotBlank(message = "ADDRESS_REQUIRED")
    @Size(max = 255, message = "ADDRESS_INVALID")
    String address;

}
