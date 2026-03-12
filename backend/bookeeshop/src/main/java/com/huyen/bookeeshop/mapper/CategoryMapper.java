package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.CategoryCreationRequest;
import com.huyen.bookeeshop.dto.request.CategoryUpdateRequest;
import com.huyen.bookeeshop.dto.response.CategoryResponse;
import com.huyen.bookeeshop.entity.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryCreationRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCategory(@MappingTarget Category category, CategoryUpdateRequest request);

    @Mapping(target = "parentId", source = "parent.id")
    CategoryResponse toCategoryResponse(Category category);
}
