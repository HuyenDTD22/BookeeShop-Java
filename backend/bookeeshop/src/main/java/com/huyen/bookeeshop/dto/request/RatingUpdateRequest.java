package com.huyen.bookeeshop.dto.request;

import com.huyen.bookeeshop.validator.RatingValueConstraint;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RatingUpdateRequest {

    @NotNull
    @RatingValueConstraint
    Double value;

}