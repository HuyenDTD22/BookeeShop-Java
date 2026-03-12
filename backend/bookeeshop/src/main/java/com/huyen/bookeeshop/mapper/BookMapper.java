package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.BookCreationRequest;
import com.huyen.bookeeshop.dto.request.BookUpdateRequest;
import com.huyen.bookeeshop.dto.response.BookResponse;
import com.huyen.bookeeshop.entity.Book;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface BookMapper {
    Book toBook(BookCreationRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateBook(@MappingTarget Book book, BookUpdateRequest request);

    BookResponse toBookResponse(Book book);
}
