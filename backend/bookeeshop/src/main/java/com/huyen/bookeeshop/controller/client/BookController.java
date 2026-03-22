package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.BookFilterRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookCardResponse;
import com.huyen.bookeeshop.dto.response.BookDetailResponse;
import com.huyen.bookeeshop.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Book", description = "Book APIs for client")
@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookController {

    BookService bookService;

    @Operation(summary = "Search books by keyword is title, author")
    @GetMapping("/search")
    ApiResponse<List<BookCardResponse>> searchBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<List<BookCardResponse>>builder()
                .result(bookService.searchBooks(keyword, size))
                .build();
    }

    @Operation(summary = "Get all books")
    @GetMapping
    ApiResponse<Page<BookCardResponse>> getAllBooks(@ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getAllBooks(filter))
                .build();
    }

    @Operation(summary = "Get featured books")
    @GetMapping("/featured")
    ApiResponse<Page<BookCardResponse>> getFeaturedBooks(@ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getFeaturedBooks(filter))
                .build();
    }

    @Operation(summary = "Get newest books")
    @GetMapping("/newest")
    ApiResponse<Page<BookCardResponse>> getNewestBooks(@ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getNewestBooks(filter))
                .build();
    }

    @Operation(summary = "Get all books by category")
    @GetMapping("/category/{categoryId}")
    ApiResponse<Page<BookCardResponse>> getBooksByCategory(@PathVariable UUID categoryId, @ModelAttribute BookFilterRequest filter) {
        return ApiResponse.<Page<BookCardResponse>>builder()
                .result(bookService.getBooksByCategory(categoryId, filter))
                .build();
    }

    @Operation(summary = "Get book details by id")
    @GetMapping("/{bookId}")
    ApiResponse<BookDetailResponse> getBookById(@PathVariable UUID bookId) {
        return ApiResponse.<BookDetailResponse>builder()
                .result(bookService.getBookById(bookId))
                .build();
    }


}
