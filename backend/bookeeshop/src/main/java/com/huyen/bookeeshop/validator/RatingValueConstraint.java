package com.huyen.bookeeshop.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = RatingValueValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface RatingValueConstraint {

    String message() default "INVALID_RATING_VALUE";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}