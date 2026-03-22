package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookRatingSummaryResponse;
import com.huyen.bookeeshop.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Rating", description = "Rating APIs for admin")
@RestController
@RequestMapping("${app.admin-prefix}/ratings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminRatingController {

    RatingService ratingService;

    @Operation(summary = "Get ratings for a book by ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/books/{bookId}")
    @PreAuthorize("hasAuthority('RATING_VIEW')")
    ApiResponse<BookRatingSummaryResponse> getRatingsByBookId(@PathVariable UUID bookId) {
        return ApiResponse.<BookRatingSummaryResponse>builder()
                .result(ratingService.getRatingsByBookId(bookId))
                .build();
    }

}