package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    UUID id;

    String name;

    String thumbnail;

    String description;

    UUID parentId;

    String parentName;

}
