package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.internal.AutoNotificationData;
import com.huyen.bookeeshop.dto.request.NotificationCreationRequest;
import com.huyen.bookeeshop.dto.request.NotificationFilterRequest;
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

    // 1. ADMIN - Lấy tất cả thông báo Admin tạo thủ công
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

    // 2. ADMIN - Lấy chi tiết 1 thông báo theo ID.
    @Transactional(readOnly = true)
    public NotificationResponse adminGetById(UUID notificationId) {
        Notification notification = notificationRepository
                .findByIdAndDeletedFalse(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        return notificationMapper.toNotificationResponse(notification);
    }

    /**
     * 3. ADMIN - Tạo thông báo mới.
     *  - Nếu scheduledAt == null  → dispatch ngay, status = SENT
     *  - Nếu scheduledAt != null  → lưu với status = SCHEDULED, NotificationScheduler sẽ dispatch đúng giờ
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

        boolean isSendNow = request.getScheduledAt() == null;

        if (isSendNow) {
            // Dispatch ngay
            List<User> recipients = resolveRecipients(request);
            dispatchToUsers(notification, recipients);
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } else {
            // Lên lịch — Scheduler sẽ gọi dispatchScheduled() sau
            notification.setStatus(NotificationStatus.SCHEDULED);
        }

        notification.setUpdatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);

        return notificationMapper.toNotificationResponse(saved);
    }

    // 4. ADMIN - Xoá mềm 1 thông báo (hỉ được xoá thông báo ở trạng thái DRAFT hoặc SCHEDULED)
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

    // 5. ADMIN - Lấy danh sách user đã đọc 1 thông báo.
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

    // 6. ADMIN - Huỷ 1 thông báo đã lên lịch trước khi đến giờ gửi.
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
    // CLIENT APIs
    // =========================================================================

    // 1. CLIENT - Lấy tất cả thông báo của user.
    @Transactional(readOnly = true)
    public Page<NotificationClientResponse> clientGetMyNotifications(NotificationFilterRequest filter) {
        UUID userId = getCurrentUserId();

        Sort sort = "oldest".equalsIgnoreCase(filter.getSortBy())
                ? Sort.by(Sort.Direction.ASC, "notification.createdAt")
                : Sort.by(Sort.Direction.DESC, "notification.createdAt");

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        return userNotificationRepository.findByUserId(userId, pageable)
                .map(notificationMapper::toClientNotificationResponse);
    }

    // 2. CLIENT - Lấy chi tiết 1 thông báo của user.
    @Transactional(readOnly = true)
    public NotificationClientResponse clientGetById(UUID notificationId) {
        UUID userId = getCurrentUserId();

        UserNotification userNotification = userNotificationRepository
                .findByNotificationIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        return notificationMapper.toClientNotificationResponse(userNotification);
    }

    // 3. CLIENT - Đánh dấu 1 thông báo là đã đọc.
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

    // 4. CLIENT - Đánh dấu tất cả thông báo là đã đọc.
    @Transactional
    public void clientMarkAllAsRead() {
        UUID userId = getCurrentUserId();
        userNotificationRepository.markAllAsRead(userId);
    }

    // 5. CLIENT - Lấy số lượng thông báo chưa đọc.
    @Transactional(readOnly = true)
    public UnreadCountResponse clientGetUnreadCount() {
        UUID userId = getCurrentUserId();
        long count = userNotificationRepository.countByUserIdAndIsReadFalse(userId);
        return UnreadCountResponse.builder().unreadCount(count).build();
    }

    // =========================================================================
    // INTERNAL — dùng bởi OrderService và NotificationScheduler
    // =========================================================================

    /**
     * Tạo và dispatch thông báo tự động từ hệ thống.
     * Gọi từ OrderService khi: đặt hàng thành công / trạng thái đơn thay đổi.
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
     * Dispatch 1 thông báo đã lên lịch đến danh sách người nhận.
     * Gọi bởi NotificationScheduler khi đến giờ gửi.
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
    // PRIVATE HELPERS
    // =========================================================================

    // Resolve danh sách người nhận từ NotificationCreateRequest (lúc tạo mới).
    private List<User> resolveRecipients(NotificationCreationRequest request) {
        return switch (request.getAudienceType()) {
            case ALL -> userRepository.findAllByDeletedFalse();

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

    // Resolve danh sách người nhận từ Notification entity đã lưu (lúc scheduler chạy).
    private List<User> resolveRecipientsByNotification(Notification notification) {
        NotificationAudienceType audienceType = notification.getAudienceType();

        if (audienceType == null) {
            return List.of();
        }

        return switch (audienceType) {
            case ALL -> userRepository.findAllByDeletedFalse();

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

    // Tạo UserNotification cho mỗi recipient và gắn vào Notification trước khi lưu.
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