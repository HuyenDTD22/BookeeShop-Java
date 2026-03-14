package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.BookCreationRequest;
import com.huyen.bookeeshop.dto.request.BookUpdateRequest;
import com.huyen.bookeeshop.dto.response.BookCardResponse;
import com.huyen.bookeeshop.dto.response.BookDetailResponse;
import com.huyen.bookeeshop.dto.response.BookResponse;
import com.huyen.bookeeshop.entity.Book;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BookMapper {
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "ratings", ignore = true)
    Book toBook(BookCreationRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "ratings", ignore = true)
    void updateBook(@MappingTarget Book book, BookUpdateRequest request);

    BookResponse toBookResponse(Book book);

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "inStock", expression = "java(book.getStock() != null && book.getStock() > 0)")
    @Mapping(target = "finalPrice", expression = "java(calcFinalPrice(book.getPrice(), book.getDiscountPercentage()))")
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "totalRatings", ignore = true)
    @Mapping(target = "purchaseCount", ignore = true)
    BookCardResponse toBookCardResponse(Book book);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "inStock", expression = "java(book.getStock() != null && book.getStock() > 0)")
    @Mapping(target = "finalPrice", expression = "java(calcFinalPrice(book.getPrice(), book.getDiscountPercentage()))")
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "totalRatings", ignore = true)
    @Mapping(target = "purchaseCount", ignore = true)
    BookDetailResponse toBookDetailResponse(Book book);

    // Tính giá sau giảm
    default Double calcFinalPrice(Double price, Double discountPercentage) {
        if (price == null) return null;
        if (discountPercentage == null || discountPercentage <= 0) return price;
        return Math.round(price * (1 - discountPercentage / 100) * 100.0) / 100.0;
    }
}
