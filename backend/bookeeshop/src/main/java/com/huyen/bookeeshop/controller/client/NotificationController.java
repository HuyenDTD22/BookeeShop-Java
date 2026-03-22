package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.NotificationFilterRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.NotificationClientResponse;
import com.huyen.bookeeshop.dto.response.UnreadCountResponse;
import com.huyen.bookeeshop.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Notification", description = "Notification APIs for client")
@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @Operation(summary = "Get all notifications of user")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Page<NotificationClientResponse>> getMyNotifications(
            @ModelAttribute NotificationFilterRequest filter) {

        return ApiResponse.<Page<NotificationClientResponse>>builder()
                .result(notificationService.clientGetMyNotifications(filter))
                .build();
    }

    @Operation(summary = "Get count of unread notifications of user")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UnreadCountResponse> getUnreadCount() {
        return ApiResponse.<UnreadCountResponse>builder()
                .result(notificationService.clientGetUnreadCount())
                .build();
    }

    @Operation(summary = "Get notification details by ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationClientResponse> getById(
            @PathVariable UUID notificationId) {

        return ApiResponse.<NotificationClientResponse>builder()
                .result(notificationService.clientGetById(notificationId))
                .build();
    }

    @Operation(summary = "Mark a notification as read")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<NotificationClientResponse> markAsRead(
            @PathVariable UUID notificationId) {

        return ApiResponse.<NotificationClientResponse>builder()
                .result(notificationService.clientMarkAsRead(notificationId))
                .message("Notification marked as read")
                .build();
    }

    @Operation(summary = "Mark all notifications as read")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.clientMarkAllAsRead();

        return ApiResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }
}