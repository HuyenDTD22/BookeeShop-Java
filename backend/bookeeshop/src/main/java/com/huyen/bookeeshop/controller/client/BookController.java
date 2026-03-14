package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.BookFilterRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookCardResponse;
import com.huyen.bookeeshop.dto.response.BookDetailResponse;
import com.huyen.bookeeshop.service.BookService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookController {

    BookService bookService;

    @GetMapping
    ApiResponse<Page<BookCardResponse>> getAllBooks(@ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getAllBooks(filter))
                .build();
    }

    @GetMapping("/featured")
    ApiResponse<Page<BookCardResponse>> getFeaturedBooks(@ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getFeaturedBooks(filter))
                .build();
    }

    @GetMapping("/newest")
    ApiResponse<Page<BookCardResponse>> getNewestBooks(@ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getNewestBooks(filter))
                .build();
    }

    @GetMapping("/category/{categoryId}")
    ApiResponse<Page<BookCardResponse>> getBooksByCategory(@PathVariable UUID categoryId, @ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getBooksByCategory(categoryId, filter))
                .build();
    }

    @GetMapping("/{bookId}")
    ApiResponse<BookDetailResponse> getBookById(@PathVariable UUID bookId) {
        return ApiResponse.<BookDetailResponse>builder()
                .result(bookService.getBookById(bookId))
                .build();
    }


}
