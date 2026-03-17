package com.huyen.bookeeshop.validator;

import com.huyen.bookeeshop.dto.request.NotificationCreationRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NotificationAudienceValidator
        implements ConstraintValidator<ValidNotificationAudience, NotificationCreationRequest> {

    @Override
    public boolean isValid(NotificationCreationRequest request, ConstraintValidatorContext context) {
        if (request == null || request.getAudienceType() == null) {
            return true;
        }

        boolean valid = switch (request.getAudienceType()) {
            case ALL -> true;

            case BY_ROLE -> request.getTargetRole() != null
                    && !request.getTargetRole().isBlank();

            case SPECIFIC_USERS -> request.getTargetUserIds() != null
                    && !request.getTargetUserIds().isEmpty();
        };

        if (!valid) {
            context.disableDefaultConstraintViolation();
            String msg = switch (request.getAudienceType()) {
                case BY_ROLE       -> "targetRole is required when audienceType is BY_ROLE";
                case SPECIFIC_USERS-> "targetUserIds must not be empty when audienceType is SPECIFIC_USERS";
                default            -> "Invalid audience configuration";
            };
            context.buildConstraintViolationWithTemplate(msg)
                    .addConstraintViolation();
        }

        return valid;
    }
}