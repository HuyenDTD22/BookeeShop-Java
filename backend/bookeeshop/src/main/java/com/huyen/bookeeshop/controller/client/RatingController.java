package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.RatingCreationRequest;
import com.huyen.bookeeshop.dto.request.RatingUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookRatingSummaryResponse;
import com.huyen.bookeeshop.dto.response.RatingResponse;
import com.huyen.bookeeshop.service.RatingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/ratings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RatingController {

    RatingService ratingService;

    @GetMapping("/books/{bookId}")
    ApiResponse<BookRatingSummaryResponse> getRatingsByBookId(@PathVariable UUID bookId) {
        return ApiResponse.<BookRatingSummaryResponse>builder()
                .result(ratingService.getRatingsByBookId(bookId))
                .build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<RatingResponse> createRating(@RequestBody @Valid RatingCreationRequest request) {
        return ApiResponse.<RatingResponse>builder()
                .result(ratingService.createRating(request))
                .build();
    }

    @PatchMapping("/{ratingId}")
    ApiResponse<RatingResponse> updateRating(@PathVariable UUID ratingId, @RequestBody @Valid RatingUpdateRequest request) {
        return ApiResponse.<RatingResponse>builder()
                .result(ratingService.updateRating(ratingId, request))
                .build();
    }

    @DeleteMapping("/{ratingId}")
    ApiResponse<Void> deleteRating(@PathVariable UUID ratingId) {
        ratingService.deleteRating(ratingId);
        return ApiResponse.<Void>builder()
                .message("Rating deleted successfully")
                .build();
    }

}