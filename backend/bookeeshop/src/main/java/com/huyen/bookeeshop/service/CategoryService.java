package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.CategoryCreationRequest;
import com.huyen.bookeeshop.dto.request.CategoryUpdateRequest;
import com.huyen.bookeeshop.dto.response.CategoryResponse;
import com.huyen.bookeeshop.dto.response.CategoryTreeResponse;
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
import org.springframework.transaction.annotation.Transactional;
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

    /**
     * 1. ADMIN - Create a new category
     */
    @Transactional
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

    /**
     * 2. ADMIN - Update information of a category
     */
    @Transactional
    public CategoryResponse update(UUID categoryId, CategoryUpdateRequest request, MultipartFile thumbnail)  {
        var category = categoryRepository.findByIdAndDeletedFalse(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        categoryMapper.updateCategory(category, request);

        if (request.getRemoveParent() != null && request.getRemoveParent()) {
            category.setParent(null);
        } else if (request.getParentId() != null) {
            if (request.getParentId().equals(categoryId)) {
                throw new AppException(ErrorCode.CATEGORY_CIRCULAR_REFERENCE);
            }

            Category newParent = categoryRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            // Check newParent if is not child/grandchild of current category
            if (isDescendant(categoryId, newParent)) {
                throw new AppException(ErrorCode.CATEGORY_CIRCULAR_REFERENCE);
            }
            category.setParent(newParent);
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(thumbnail);
            category.setThumbnail(imageUrl);
        }

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    /**
     * 3. ADMIN/CLIENT - Get all categories in tree structure
     */
    @Transactional(readOnly = true)
    public List<CategoryTreeResponse> getAll() {
        try {
            return categoryRepository.findRootCategories()
                    .stream()
                    .map(categoryMapper::toCategoryTreeResponse)
                    .toList();

        } catch (Exception e) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
    }

    /**
     * 4. ADMIN - Get information of a category by ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getById(UUID categoryId) {
        return categoryRepository.findByIdAndDeletedFalse(categoryId)
                .map(categoryMapper::toCategoryResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    /**
     * 5. ADMIN - Delete a category (soft delete)
     */
    @Transactional
    public void delete(UUID categoryId) {
        Category category = categoryRepository.findByIdAndDeletedFalse(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (categoryRepository.hasActiveChildren(categoryId)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_CHILDREN);
        }

        if (categoryRepository.hasActiveBooks(categoryId)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_BOOKS);
        }

        category.setDeleted(true);
        category.setDeletedAt(LocalDateTime.now());

        categoryRepository.save(category);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Check if candidate is child/grandchild if targetId
     */
    private boolean isDescendant(UUID targetId, Category candidate) {
        Category current = candidate;
        int maxDepth = 20; // Limit the loop to prevent data corrupt
        int depth = 0;

        while (current != null && depth < maxDepth) {
            if (current.getId().equals(targetId)) {
                return true;
            }
            current = current.getParent();
            depth++;
        }
        return false;
    }

}
