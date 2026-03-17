package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookRatingSummaryResponse;
import com.huyen.bookeeshop.service.RatingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("${app.admin-prefix}/ratings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminRatingController {

    RatingService ratingService;

    @GetMapping("/books/{bookId}")
    @PreAuthorize("hasAuthority('RATING_VIEW')")
    ApiResponse<BookRatingSummaryResponse> getRatingsByBookId(@PathVariable UUID bookId) {
        return ApiResponse.<BookRatingSummaryResponse>builder()
                .result(ratingService.getRatingsByBookId(bookId))
                .build();
    }

}