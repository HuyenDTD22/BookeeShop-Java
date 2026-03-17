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

    // 1. ADMIN - Tạo mới 1 category
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

    // 2. ADMIN - Cập nhật thông tin category
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

            // Kiểm tra newParent không phải là con/cháu của category hiện tại
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

    // 3. ADMIN/CLIENT - Lấy thông tin tất cả category theo cấu trúc cây
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

    // 4. ADMIN - Lấy thông tin category theo ID
    public CategoryResponse getById(UUID categoryId) {
        return categoryRepository.findByIdAndDeletedFalse(categoryId)
                .map(categoryMapper::toCategoryResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    // 5. ADMIN - Xóa category (soft delete)
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

    // Kiểm tra xem candidate có phải là con/cháu của targetId không
    private boolean isDescendant(UUID targetId, Category candidate) {
        Category current = candidate;
        int maxDepth = 20; // Giới hạn vòng lặp đề phòng data corrupt
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
