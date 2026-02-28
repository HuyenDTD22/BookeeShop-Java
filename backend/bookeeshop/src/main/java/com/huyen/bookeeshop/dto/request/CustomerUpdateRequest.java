package com.huyen.bookeeshop.dto.request;

import java.time.LocalDate;

import com.huyen.bookeeshop.validator.DobConstraint;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerUpdateRequest {
    @Size(min = 8, max = 100, message = "PASSWORD_INVALID")
    String password;

    @Size(max = 100)
    String fullName;

    @DobConstraint(min = 10, message = "INVALID_DOB")
    LocalDate dob;

    String gender;

    @Pattern(regexp = "^\\d{10,11}$", message = "PHONE_INVALID")
    String phone;

    String address;
}
