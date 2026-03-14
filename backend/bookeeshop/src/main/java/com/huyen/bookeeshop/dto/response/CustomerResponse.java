package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {
    UUID id;
    String username;
    String fullName;
    String gender;
    String phone;
    String address;
    String avatar;
    LocalDate dob;
    Boolean locked;
    LocalDateTime createdAt;
}
