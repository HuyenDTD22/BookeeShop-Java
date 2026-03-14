package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.CategoryCreationRequest;
import com.huyen.bookeeshop.dto.request.CategoryUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.CategoryResponse;
import com.huyen.bookeeshop.dto.response.CategoryTreeResponse;
import com.huyen.bookeeshop.service.CategoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryController {

    CategoryService categoryService;

    @GetMapping
    ApiResponse<List<CategoryTreeResponse>> getAll() {
        return ApiResponse.<List<CategoryTreeResponse>>builder()
                .result(categoryService.getAll())
                .build();
    }
}
