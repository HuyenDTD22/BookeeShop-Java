package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.AdminBookFilterRequest;
import com.huyen.bookeeshop.dto.request.BookCreationRequest;
import com.huyen.bookeeshop.dto.request.BookUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookResponse;
import com.huyen.bookeeshop.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Tag(name = "Book", description = "Book APIs for admin")
@RestController
@RequestMapping("${app.admin-prefix}/books")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminBookController {

    BookService bookService;

    @Operation(summary = "Create a new book")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('BOOK_CREATE')")
    ApiResponse<BookResponse> create(@Valid @RequestPart("data") BookCreationRequest request,
                                     @RequestPart("thumbnail") MultipartFile thumbnail) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.create(request, thumbnail))
                .build();
    }

    @Operation(summary = "Update an existing book's information")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping(value = "/{bookId}", consumes = "multipart/form-data")
    @PreAuthorize("hasAuthority('BOOK_UPDATE')")
    ApiResponse<BookResponse> update(@PathVariable UUID bookId,
                                     @RequestPart("data") BookUpdateRequest request,
                                     @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.update(bookId, request, thumbnail))
                .build();
    }

    @Operation(summary = "Get all books")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasAuthority('BOOK_LIST_VIEW')")
    ApiResponse<Page<BookResponse>> getAll(@ModelAttribute AdminBookFilterRequest filter) {
        return ApiResponse.<Page<BookResponse>>builder()
                .result(bookService.getAll(filter))
                .build();
    }

    @Operation(summary = "Get detail book by its ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{bookId}")
    @PreAuthorize("hasAuthority('BOOK_VIEW')")
    ApiResponse<BookResponse> getById(@PathVariable UUID bookId) {
        return ApiResponse.<BookResponse>builder()
                .result(bookService.getById(bookId))
                .build();
    }

    @Operation(summary = "Delete a book by its ID")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasAuthority('BOOK_DELETE')")
    ApiResponse<String> delete(@PathVariable UUID bookId) {
        bookService.delete(bookId);

        return ApiResponse.<String>builder()
                .result("Book has been deleted")
                .build();
    }
}
