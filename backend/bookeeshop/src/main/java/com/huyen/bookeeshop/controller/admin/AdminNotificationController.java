package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.NotificationCreationRequest;
import com.huyen.bookeeshop.dto.request.NotificationFilterRequest;
import com.huyen.bookeeshop.dto.request.NotificationUpdateRequest;
import com.huyen.bookeeshop.dto.response.*;
import com.huyen.bookeeshop.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Notification", description = "Notification APIs for admin")
@Slf4j
@RestController
@RequestMapping("${app.admin-prefix}/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminNotificationController {

    NotificationService notificationService;

    @Operation(summary = "Get all notifications")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_LIST_VIEW')")
    public ApiResponse<Page<NotificationResponse>> getAll(
            @ModelAttribute NotificationFilterRequest filter) {

        return ApiResponse.<Page<NotificationResponse>>builder()
                .result(notificationService.adminGetAll(filter))
                .build();
    }

    @Operation(summary = "Get notification details by ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{notificationId}")
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public ApiResponse<NotificationResponse> getById(
            @PathVariable UUID notificationId) {

        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminGetById(notificationId))
                .build();
    }

    @Operation(summary = "Create a new notification")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_CREATE')")
    public ApiResponse<NotificationResponse> create(
            @RequestBody @Valid NotificationCreationRequest request) {

        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminCreate(request))
                .message("Notification created successfully")
                .build();
    }

    @Operation(summary = "Update an notification")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{notificationId}")
    @PreAuthorize("hasAuthority('NOTIFICATION_UPDATE')")
    public ApiResponse<NotificationResponse> update(
            @PathVariable UUID notificationId,
            @RequestBody @Valid NotificationUpdateRequest request) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminUpdate(notificationId, request))
                .message("Notification updated successfully")
                .build();
    }

    @Operation(summary = "Delete a notification")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAuthority('NOTIFICATION_DELETE')")
    public ApiResponse<Void> delete(@PathVariable UUID notificationId) {
        notificationService.adminDelete(notificationId);

        return ApiResponse.<Void>builder()
                .message("Notification deleted successfully")
                .build();
    }

    @Operation(summary = "Cancel a notification")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/{notificationId}/cancel")
    @PreAuthorize("hasAuthority('NOTIFICATION_CANCEL')")
    public ApiResponse<NotificationResponse> cancel(@PathVariable UUID notificationId) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminCancel(notificationId))
                .message("Notification cancelled successfully")
                .build();
    }

    @Operation(summary = "Get readers of a notification")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{notificationId}/readers")
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public ApiResponse<List<NotificationReaderResponse>> getReaders(
            @PathVariable UUID notificationId) {

        return ApiResponse.<List<NotificationReaderResponse>>builder()
                .result(notificationService.adminGetReaders(notificationId))
                .build();
    }

    @Operation(summary = "Get current user's notifications")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ApiResponse<Page<NotificationClientResponse>> getMyNotifications(
            @ModelAttribute NotificationFilterRequest filter) {
        return ApiResponse.<Page<NotificationClientResponse>>builder()
                .result(notificationService.clientGetMyNotifications(filter))
                .build();
    }

    @Operation(summary = "Get notification details by ID for user")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/{notificationId}")
    public ApiResponse<NotificationClientResponse> getMyNotificationById(
            @PathVariable UUID notificationId) {
        return ApiResponse.<NotificationClientResponse>builder()
                .result(notificationService.clientGetById(notificationId))
                .build();
    }

    @Operation(summary = "Mark a notification as read for user")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/me/{notificationId}/read")
    public ApiResponse<NotificationClientResponse> markAsRead(
            @PathVariable UUID notificationId) {
        return ApiResponse.<NotificationClientResponse>builder()
                .result(notificationService.clientMarkAsRead(notificationId))
                .build();
    }

    @Operation(summary = "Mark all notifications as read for user")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/me/read-all")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.clientMarkAllAsRead();
        return ApiResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }

    @Operation(summary = "Get count of unread notifications of user")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me/unread-count")
    public ApiResponse<UnreadCountResponse> getUnreadCount() {
        return ApiResponse.<UnreadCountResponse>builder()
                .result(notificationService.clientGetUnreadCount())
                .build();
    }

}