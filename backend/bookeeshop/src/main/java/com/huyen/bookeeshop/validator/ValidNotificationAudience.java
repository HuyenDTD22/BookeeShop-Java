package com.huyen.bookeeshop.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NotificationAudienceValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidNotificationAudience {
    String message() default "Invalid audience configuration for the given audienceType";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}