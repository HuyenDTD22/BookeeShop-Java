package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.constant.PredefinedRole;
import com.huyen.bookeeshop.dto.internal.AutoNotificationData;
import com.huyen.bookeeshop.dto.request.NotificationCreationRequest;
import com.huyen.bookeeshop.dto.request.NotificationFilterRequest;
import com.huyen.bookeeshop.dto.request.NotificationUpdateRequest;
import com.huyen.bookeeshop.dto.response.NotificationClientResponse;
import com.huyen.bookeeshop.dto.response.NotificationReaderResponse;
import com.huyen.bookeeshop.dto.response.NotificationResponse;
import com.huyen.bookeeshop.dto.response.UnreadCountResponse;
import com.huyen.bookeeshop.entity.Notification;
import com.huyen.bookeeshop.entity.Role;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.entity.UserNotification;
import com.huyen.bookeeshop.enums.NotificationAudienceType;
import com.huyen.bookeeshop.enums.NotificationStatus;
import com.huyen.bookeeshop.enums.NotificationType;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.NotificationMapper;
import com.huyen.bookeeshop.repository.NotificationRepository;
import com.huyen.bookeeshop.repository.UserNotificationRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import com.huyen.bookeeshop.specification.NotificationSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    NotificationRepository     notificationRepository;
    UserNotificationRepository userNotificationRepository;
    UserRepository             userRepository;
    NotificationMapper         notificationMapper;

    // =========================================================================
    // ADMIN APIs
    // =========================================================================

    /**
     * 1. ADMIN - Get all notifications with filter and pagination.
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> adminGetAll(NotificationFilterRequest filter) {
        Sort sort = "oldest".equalsIgnoreCase(filter.getSortBy())
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Specification<Notification> spec = NotificationSpecification.adminFilter(filter);

        return notificationRepository.findAll(spec, pageable)
                .map(notificationMapper::toNotificationResponse);
    }

    /**
     * 2. ADMIN - Get details of a notification by ID
     */
    @Transactional(readOnly = true)
    public NotificationResponse adminGetById(UUID notificationId) {
        Notification notification = notificationRepository
                .findByIdAndDeletedFalse(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        return notificationMapper.toNotificationResponse(notification);
    }

    /**
     * 3. ADMIN - Create a new notification
     *  - if scheduledAt == null  → dispatch now, status = SENT
     *  - if scheduledAt != null  → save with status = SCHEDULED
     */
    @Transactional
    public NotificationResponse adminCreate(NotificationCreationRequest request) {
        String currentAdmin = getCurrentUsername();

        Notification notification = Notification.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .audienceType(request.getAudienceType())
                .targetRole(request.getTargetRole())
                .scheduledAt(request.getScheduledAt())
                .createdBy(currentAdmin)
                .build();

        boolean isDraftRequest = Boolean.TRUE.equals(request.getIsDraft());
        boolean isSendNow      = !isDraftRequest && request.getScheduledAt() == null;

        if (isDraftRequest) {
            notification.setStatus(NotificationStatus.DRAFT);
        } else if (isSendNow) {
            List<User> recipients = resolveRecipients(request);
            dispatchToUsers(notification, recipients);
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } else {
            // isScheduled
            notification.setStatus(NotificationStatus.SCHEDULED);
        }

        notification.setUpdatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);

        return notificationMapper.toNotificationResponse(saved);
    }

    /**
     * 4. ADMIN - Update a notification (only allowed when status is DRAFT or SCHEDULED)
       - if update scheduledAt: ensure status = SCHEDULED
       - if remove scheduledAt: set status = DRAFT
     */
    @Transactional
    public NotificationResponse adminUpdate(UUID notificationId, NotificationUpdateRequest request) {
        Notification notification = notificationRepository
                .findByIdAndDeletedFalse(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // Chỉ cho sửa khi DRAFT hoặc SCHEDULED
        if (notification.getStatus() == NotificationStatus.SENT
                || notification.getStatus() == NotificationStatus.CANCELLED) {
            throw new AppException(ErrorCode.NOTIFICATION_ALREADY_SENT);
        }

        // Cập nhật các field nếu có giá trị mới (null-safe)
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            notification.setTitle(request.getTitle());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            notification.setContent(request.getContent());
        }
        if (request.getType() != null) {
            notification.setType(request.getType());
        }
        if (request.getAudienceType() != null) {
            notification.setAudienceType(request.getAudienceType());
        }
        if (request.getTargetRole() != null) {
            notification.setTargetRole(request.getTargetRole());
        }

        // Xử lý scheduledAt
        if (Boolean.TRUE.equals(request.getRemoveSchedule())) {
            // Xóa lịch gửi → chuyển về DRAFT
            notification.setScheduledAt(null);
            notification.setStatus(NotificationStatus.DRAFT);
        } else if (request.getScheduledAt() != null) {
            // Cập nhật lịch gửi mới → đảm bảo status là SCHEDULED
            notification.setScheduledAt(request.getScheduledAt());
            notification.setStatus(NotificationStatus.SCHEDULED);
        }

        notification.setUpdatedAt(LocalDateTime.now());
        return notificationMapper.toNotificationResponse(notificationRepository.save(notification));
    }

    /**
     * 5. ADMIN - Delete a notification (soft delete, only allowed when status is DRAFT or SCHEDULED)
     */
    @Transactional
    public void adminDelete(UUID notificationId) {
        Notification notification = notificationRepository
                .findByIdAndDeletedFalse(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (notification.getStatus() == NotificationStatus.SENT) {
            throw new AppException(ErrorCode.NOTIFICATION_ALREADY_SENT);
        }

        notification.setDeleted(true);
        notification.setDeletedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    /**
     * 6. ADMIN - Get list of users who have read a specific notification
     */
    @Transactional(readOnly = true)
    public List<NotificationReaderResponse> adminGetReaders(UUID notificationId) {
        notificationRepository.findByIdAndDeletedFalse(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        return userNotificationRepository
                .findReadUsersByNotificationId(notificationId)
                .stream()
                .map(notificationMapper::toNotificationReaderResponse)
                .toList();
    }

    /**
     * 7. ADMIN - Cancel a notification (only allowed when status is DRAFT or SCHEDULED)
     */
    @Transactional
    public NotificationResponse adminCancel(UUID notificationId) {
        Notification notification = notificationRepository
                .findByIdAndDeletedFalse(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (notification.getStatus() != NotificationStatus.SCHEDULED
                && notification.getStatus() != NotificationStatus.DRAFT) {
            throw new AppException(ErrorCode.NOTIFICATION_CANNOT_BE_CANCELLED);
        }

        notification.setStatus(NotificationStatus.CANCELLED);
        notification.setUpdatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        return notificationMapper.toNotificationResponse(notification);
    }

    // =========================================================================
    // CLIENT and ADMIN APIs
    // =========================================================================

    /**
     * 1. CLIENT/ADMIN - Get all notifications of current user with filter and pagination.
     */
    @Transactional(readOnly = true)
    public Page<NotificationClientResponse> clientGetMyNotifications(NotificationFilterRequest filter) {
        UUID userId = getCurrentUserId();

        Sort sort = "oldest".equalsIgnoreCase(filter.getSortBy())
                ? Sort.by(Sort.Direction.ASC, "notification.createdAt")
                : Sort.by(Sort.Direction.DESC, "notification.createdAt");

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // Truyền type vào query (null = lấy tất cả)
        NotificationType type = filter.getType();

        return userNotificationRepository.findByUserIdAndType(userId, type, pageable)
                .map(notificationMapper::toClientNotificationResponse);
    }

    /**
     * 2. CLIENT/ADMIN - Get details of a notification by ID (only if it belongs to current user)
     */
    public NotificationClientResponse clientGetById(UUID notificationId) {
        UUID userId = getCurrentUserId();

        UserNotification userNotification = userNotificationRepository
                .findByNotificationIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        return notificationMapper.toClientNotificationResponse(userNotification);
    }

    /**
     * 3. CLIENT/ADMIN - Mark a notification as read (only if it belongs to current user)
     */
    @Transactional
    public NotificationClientResponse clientMarkAsRead(UUID notificationId) {
        UUID userId = getCurrentUserId();

        UserNotification userNotification = userNotificationRepository
                .findByNotificationIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!Boolean.TRUE.equals(userNotification.getIsRead())) {
            userNotification.setIsRead(true);
            userNotification.setReadAt(LocalDateTime.now());
            userNotificationRepository.save(userNotification);
        }

        return notificationMapper.toClientNotificationResponse(userNotification);
    }

    /**
     * 4. CLIENT/ADMIN - Mark all notifications as read for current user
     */
    @Transactional
    public void clientMarkAllAsRead() {
        UUID userId = getCurrentUserId();
        userNotificationRepository.markAllAsRead(userId);
    }

    /**
     * 5. CLIENT/ADMIN - Get count of unread notifications for current user
     */
    @Transactional(readOnly = true)
    public UnreadCountResponse clientGetUnreadCount() {
        UUID userId = getCurrentUserId();
        long count = userNotificationRepository.countByUserIdAndIsReadFalse(userId);
        return UnreadCountResponse.builder().unreadCount(count).build();
    }

    // =========================================================================
    // INTERNAL — use by OrderService và NotificationScheduler
    // =========================================================================

    /**
     * Send system notifications for order events.
     */
    @Transactional
    public void sendAutoNotification(AutoNotificationData data) {
        // Tránh gửi trùng nếu callback được gọi nhiều lần
        if (notificationRepository.existsByRefIdAndTypeAndDeletedFalse(data.getRefId(), data.getType())) {
            return;
        }

        User recipient = userRepository.findByIdAndDeletedFalse(data.getRecipientUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Notification notification = Notification.builder()
                .title(data.getTitle())
                .content(data.getContent())
                .type(data.getType())
                .refId(data.getRefId())
                .status(NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .createdBy("SYSTEM")
                .updatedAt(LocalDateTime.now())
                .build();

        UserNotification userNotification = UserNotification.builder()
                .user(recipient)
                .notification(notification)
                .isRead(false)
                .build();

        notification.setUserNotifications(List.of(userNotification));
        notificationRepository.save(notification);
    }

    /**
     * Send scheduled notification to recipients.
     */
    @Transactional
    public void dispatchScheduled(Notification notification) {
        if (notification.getStatus() != NotificationStatus.SCHEDULED) {
            return;
        }

        // Resolve lại danh sách recipient dựa theo audienceType đã lưu
        List<User> recipients = resolveRecipientsByNotification(notification);
        dispatchToUsers(notification, recipients);

        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Resolve list of recipient users based on audienceType and related fields in the creation request.
     */
    private List<User> resolveRecipients(NotificationCreationRequest request) {
        return switch (request.getAudienceType()) {
            case ALL -> userRepository.findAllByDeletedFalse();

            case CUSTOMERS -> userRepository.findAllByDeletedFalse().stream()
                    .filter(u -> u.getRoles().stream()
                            .anyMatch(r -> PredefinedRole.USER_ROLE.getName().equals(r.getName())))
                    .toList();

            case STAFF -> userRepository.findAllByDeletedFalse().stream()
                    .filter(u -> u.getRoles().stream()
                            .anyMatch(r -> r.getName().startsWith("STAFF_")))
                    .toList();

            case BY_ROLE -> userRepository.findAllByDeletedFalse().stream()
                    .filter(u -> u.getRoles().stream()
                            .map(Role::getName)
                            .anyMatch(name -> name.equalsIgnoreCase(request.getTargetRole())))
                    .toList();

            case SPECIFIC_USERS -> {
                List<User> users = userRepository.findAllById(request.getTargetUserIds());

                if (users.size() != request.getTargetUserIds().size()) {
                    throw new AppException(ErrorCode.USER_NOT_EXISTED);
                }
                yield users.stream().filter(u -> !u.getDeleted()).toList();
            }
        };
    }

    /**
     * Resolve list of recipient users based on audienceType and related fields in the Notification entity
     */
    private List<User> resolveRecipientsByNotification(Notification notification) {
        NotificationAudienceType audienceType = notification.getAudienceType();

        if (audienceType == null) {
            return List.of();
        }

        return switch (audienceType) {
            case ALL -> userRepository.findAllByDeletedFalse();

            case CUSTOMERS -> userRepository.findAllByDeletedFalse().stream()
                    .filter(u -> u.getRoles().stream()
                            .anyMatch(r -> PredefinedRole.USER_ROLE.getName().equals(r.getName())))
                    .toList();

            case STAFF -> userRepository.findAllByDeletedFalse().stream()
                    .filter(u -> u.getRoles().stream()
                            .anyMatch(r -> r.getName().startsWith("STAFF_")))
                    .toList();

            case BY_ROLE -> userRepository.findAllByDeletedFalse().stream()
                    .filter(u -> u.getRoles().stream()
                            .map(Role::getName)
                            .anyMatch(name -> name.equalsIgnoreCase(notification.getTargetRole())))
                    .toList();

            case SPECIFIC_USERS ->
                 notification.getUserNotifications() != null
                        ? notification.getUserNotifications().stream()
                        .map(UserNotification::getUser)
                        .toList()
                        : List.of();

        };
    }

    /**
     * Create UserNotification for each recipient and match for Notification before saving.
     */
    private void dispatchToUsers(Notification notification, List<User> recipients) {
        if (recipients.isEmpty()) {
            return;
        }

        List<UserNotification> userNotifications = recipients.stream()
                .map(user -> UserNotification.builder()
                        .user(user)
                        .notification(notification)
                        .isRead(false)
                        .build())
                .toList();

        notification.setUserNotifications(userNotifications);
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UUID getCurrentUserId() {
        String username = getCurrentUsername();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED))
                .getId();
    }
}