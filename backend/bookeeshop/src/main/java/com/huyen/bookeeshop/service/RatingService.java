package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.RatingCreationRequest;
import com.huyen.bookeeshop.dto.request.RatingUpdateRequest;
import com.huyen.bookeeshop.dto.response.BookRatingSummaryResponse;
import com.huyen.bookeeshop.dto.response.RatingResponse;
import com.huyen.bookeeshop.entity.Book;
import com.huyen.bookeeshop.entity.Rating;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.RatingMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import com.huyen.bookeeshop.repository.RatingRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RatingService {

    RatingRepository ratingRepository;
    BookRepository bookRepository;
    UserRepository userRepository;
    RatingMapper ratingMapper;

    /**
     * 1. CLIENT/ADMIN - Get all ratings for a book
     */
    @Transactional(readOnly = true)
    public BookRatingSummaryResponse getRatingsByBookId(UUID bookId) {
        if (!bookRepository.existsByIdAndDeletedFalse(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        List<Rating> ratings = ratingRepository.findAllByBookIdAndDeletedFalse(bookId);

        return buildSummary(ratings);
    }

    /**
     * 2. CLIENT - Create a new rating for a book
      * - User must have purchased the book to rate it
      * - User can only rate a book once (no duplicates)
     */
    @Transactional
    public RatingResponse createRating(RatingCreationRequest request) {
        User currentUser = getCurrentUser();
        Book book = getActiveBook(request.getBookId());

        // Kiểm tra user đã từng mua sách chưa
        if (!ratingRepository.hasUserPurchasedBook(currentUser.getId(), book.getId())) {
            throw new AppException(ErrorCode.RATING_NOT_PURCHASED);
        }

        // Kiểm tra user đã rating quyển sách này chưa (mỗi user chỉ rating 1 lần)
        if (ratingRepository.existsByUserIdAndBookId(currentUser.getId(), book.getId())) {
            throw new AppException(ErrorCode.RATING_ALREADY_EXISTS);
        }

        Rating rating = Rating.builder()
                .value(request.getValue())
                .user(currentUser)
                .book(book)
                .build();

        Rating savedRating = ratingRepository.save(rating);

        return ratingMapper.toRatingResponse(savedRating);
    }

    /**
     * 3. CLIENT - Update an existing rating
     */
    @Transactional
    public RatingResponse updateRating(UUID ratingId, RatingUpdateRequest request) {
        User currentUser = getCurrentUser();

        Rating rating = ratingRepository.findByIdAndUserId(ratingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RATING_NOT_FOUND));

        rating.setValue(request.getValue());
        Rating updatedRating = ratingRepository.save(rating);

        return ratingMapper.toRatingResponse(updatedRating);
    }

    /**
     * 4. CLIENT - Delete a rating (soft delete)
     */
    @Transactional
    public void deleteRating(UUID ratingId) {
        User currentUser = getCurrentUser();

        Rating rating = ratingRepository.findByIdAndUserId(ratingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RATING_NOT_FOUND));

        rating.setDeleted(true);
        ratingRepository.save(rating);
    }

    //==========================================================================
    // HELPER
    //==========================================================================

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private Book getActiveBook(UUID bookId) {
        return bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    /**
     * Calculate rating summary for a book:
     * - Total ratings
     * - Count ratings by star (1–5)
     * - Average rating (rounded to 1 decimal)
     * - Map ratings to RatingResponse
     */
    private BookRatingSummaryResponse buildSummary(List<Rating> ratings) {
        int total = ratings.size();

        int oneStar   = (int) ratings.stream().filter(r -> r.getValue() == 1.0).count();
        int twoStar   = (int) ratings.stream().filter(r -> r.getValue() == 2.0).count();
        int threeStar = (int) ratings.stream().filter(r -> r.getValue() == 3.0).count();
        int fourStar  = (int) ratings.stream().filter(r -> r.getValue() == 4.0).count();
        int fiveStar  = (int) ratings.stream().filter(r -> r.getValue() == 5.0).count();

        double average = total == 0 ? 0.0
                : ratings.stream().mapToDouble(Rating::getValue).average().orElse(0.0);

        double roundedAverage = Math.round(average * 10.0) / 10.0;

        List<RatingResponse> ratingResponses = ratings.stream()
                .map(ratingMapper::toRatingResponse)
                .toList();

        return BookRatingSummaryResponse.builder()
                .averageRating(roundedAverage)
                .totalRatings(total)
                .oneStar(oneStar)
                .twoStar(twoStar)
                .threeStar(threeStar)
                .fourStar(fourStar)
                .fiveStar(fiveStar)
                .ratings(ratingResponses)
                .build();
    }

}