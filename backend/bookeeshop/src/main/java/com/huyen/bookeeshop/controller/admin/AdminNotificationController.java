package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.NotificationCreationRequest;
import com.huyen.bookeeshop.dto.request.NotificationFilterRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.NotificationReaderResponse;
import com.huyen.bookeeshop.dto.response.NotificationResponse;
import com.huyen.bookeeshop.service.NotificationService;
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

@Slf4j
@RestController
@RequestMapping("${app.admin-prefix}/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminNotificationController {

    NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_LIST_VIEW')")
    public ApiResponse<Page<NotificationResponse>> getAll(
            @ModelAttribute NotificationFilterRequest filter) {

        return ApiResponse.<Page<NotificationResponse>>builder()
                .result(notificationService.adminGetAll(filter))
                .build();
    }

    @GetMapping("/{notificationId}")
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public ApiResponse<NotificationResponse> getById(
            @PathVariable UUID notificationId) {

        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminGetById(notificationId))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('NOTIFICATION_CREATE')")
    public ApiResponse<NotificationResponse> create(
            @RequestBody @Valid NotificationCreationRequest request) {

        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminCreate(request))
                .message("Notification created successfully")
                .build();
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAuthority('NOTIFICATION_DELETE')")
    public ApiResponse<Void> delete(@PathVariable UUID notificationId) {
        notificationService.adminDelete(notificationId);

        return ApiResponse.<Void>builder()
                .message("Notification deleted successfully")
                .build();
    }


    @PatchMapping("/{notificationId}/cancel")
    @PreAuthorize("hasAuthority('NOTIFICATION_CANCEL')")
    public ApiResponse<NotificationResponse> cancel(@PathVariable UUID notificationId) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.adminCancel(notificationId))
                .message("Notification cancelled successfully")
                .build();
    }

    @GetMapping("/{notificationId}/readers")
    @PreAuthorize("hasAuthority('NOTIFICATION_VIEW')")
    public ApiResponse<List<NotificationReaderResponse>> getReaders(
            @PathVariable UUID notificationId) {

        return ApiResponse.<List<NotificationReaderResponse>>builder()
                .result(notificationService.adminGetReaders(notificationId))
                .build();
    }
}