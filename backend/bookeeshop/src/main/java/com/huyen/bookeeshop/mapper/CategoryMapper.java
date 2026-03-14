package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.CategoryCreationRequest;
import com.huyen.bookeeshop.dto.request.CategoryUpdateRequest;
import com.huyen.bookeeshop.dto.response.CategoryResponse;
import com.huyen.bookeeshop.dto.response.CategoryTreeResponse;
import com.huyen.bookeeshop.entity.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "children", ignore = true)
    Category toCategory(CategoryCreationRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "books", ignore = true)
    @Mapping(target = "children", ignore = true)
    void updateCategory(@MappingTarget Category category, CategoryUpdateRequest request);

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    CategoryResponse toCategoryResponse(Category category);

    @Mapping(target = "children", source = "children")
    CategoryTreeResponse toCategoryTreeResponse(Category category);
}
