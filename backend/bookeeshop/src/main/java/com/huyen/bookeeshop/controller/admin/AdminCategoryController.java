package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.CategoryCreationRequest;
import com.huyen.bookeeshop.dto.request.CategoryUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.CategoryResponse;
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
@RequestMapping("${app.admin-prefix}/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminCategoryController {

    CategoryService categoryService;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('CATEGORY_CREATE')")
    ApiResponse<CategoryResponse> create(@Valid @RequestPart("data") CategoryCreationRequest request,
                                     @RequestPart("thumbnail") MultipartFile thumbnail) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.create(request, thumbnail))
                .build();
    }

    @PutMapping(value = "/{categoryId}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
    ApiResponse<CategoryResponse> update(@PathVariable UUID categoryId,
                                     @RequestPart("data") CategoryUpdateRequest request,
                                     @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.update(categoryId, request, thumbnail))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CATEGORY_LIST_VIEW')")
    ApiResponse<List<CategoryResponse>> getAll() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getAll())
                .build();
    }

    @GetMapping("/{categoryId}")
    @PreAuthorize("hasAuthority('CATEGORY_VIEW')")
    ApiResponse<CategoryResponse> getById(@PathVariable UUID categoryId) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.getById(categoryId))
                .build();
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasAuthority('CATEGORY_DELETE')")
    ApiResponse<String> delete(@PathVariable UUID categoryId) {
        categoryService.delete(categoryId);

        return ApiResponse.<String>builder()
                .result("Category has been deleted")
                .build();
    }
}
