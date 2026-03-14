package com.huyen.bookeeshop.dto.response;

import java.util.List;
import java.util.UUID;

public class CategoryTreeResponse {
    UUID id;

    String name;

    String thumbnail;

    String description;

    List<CategoryTreeResponse> children;
}
