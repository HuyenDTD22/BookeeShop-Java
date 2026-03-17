package com.huyen.bookeeshop.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

public class RatingValueValidator implements ConstraintValidator<RatingValueConstraint, Double> {

    private static final Set<Double> VALID_VALUES = Set.of(1.0, 2.0, 3.0, 4.0, 5.0);

    @Override
    public boolean isValid(Double value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return VALID_VALUES.contains(value);
    }

}