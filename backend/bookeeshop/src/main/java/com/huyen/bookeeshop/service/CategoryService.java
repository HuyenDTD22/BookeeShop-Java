package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.CategoryCreationRequest;
import com.huyen.bookeeshop.dto.request.CategoryUpdateRequest;
import com.huyen.bookeeshop.dto.response.CategoryResponse;
import com.huyen.bookeeshop.entity.Category;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.CategoryMapper;
import com.huyen.bookeeshop.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {
    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;
    CloudinaryService cloudinaryService;

    public CategoryResponse create(CategoryCreationRequest request, MultipartFile thumbnail) {
        var category = categoryMapper.toCategory(request);

        if(request.getParentId() != null){
            Category parent = categoryRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            category.setParent(parent);
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(thumbnail);
            category.setThumbnail(imageUrl);
        }

        try {
            category = categoryRepository.save(category);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        return categoryMapper.toCategoryResponse(category);
    }

    public CategoryResponse update(UUID categoryId, CategoryUpdateRequest request, MultipartFile thumbnail)  {
        var category = categoryRepository.findByIdAndDeletedFalse(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        categoryMapper.updateCategory(category, request);

        if(request.getParentId() != null){
            Category parent = categoryRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            category.setParent(parent);
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(thumbnail);
            category.setThumbnail(imageUrl);
        }

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> getAll() {
        try {
            return categoryRepository.findAllByDeletedFalse()
                    .stream()
                    .map(categoryMapper::toCategoryResponse)
                    .toList();

        } catch (Exception e) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
    }

    public CategoryResponse getById(UUID categoryId) {
        return categoryRepository.findByIdAndDeletedFalse(categoryId)
                .map(categoryMapper::toCategoryResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    public void delete(UUID categoryId) {
        Category category = categoryRepository.findByIdAndDeletedFalse(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setDeleted(true);
        category.setDeletedAt(LocalDateTime.now());

        categoryRepository.save(category);
    }
}
