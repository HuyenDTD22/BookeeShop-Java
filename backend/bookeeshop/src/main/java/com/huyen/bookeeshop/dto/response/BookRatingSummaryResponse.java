package com.huyen.bookeeshop.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookRatingSummaryResponse {

    Double averageRating;
    Integer totalRatings;

    // Phân bổ số lượng theo từng mức sao (1 -> 5)
    Integer oneStar;
    Integer twoStar;
    Integer threeStar;
    Integer fourStar;
    Integer fiveStar;

    List<RatingResponse> ratings;

}