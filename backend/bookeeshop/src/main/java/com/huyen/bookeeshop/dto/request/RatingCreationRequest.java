package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.validator.RatingValueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingCreationRequest {

    @NotNull(message = "BOOK_NOT_FOUND")
    UUID bookId;

    @NotNull
    @RatingValueConstraint
    Double value;

}