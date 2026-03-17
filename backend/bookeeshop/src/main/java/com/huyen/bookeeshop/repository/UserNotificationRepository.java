package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserNotificationRepository
        extends JpaRepository<UserNotification, UUID>, JpaSpecificationExecutor<UserNotification> {

    Optional<UserNotification> findByNotificationIdAndUserId(UUID notificationId, UUID userId);

    // Lấy danh sách user_notifications của 1 user
    @Query("""
            SELECT un FROM UserNotification un
            JOIN FETCH un.notification n
            WHERE un.user.id = :userId
              AND n.deleted = false
            """)
    Page<UserNotification> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    // Lấy danh sách user đã đọc 1 thông báo
    @Query("""
            SELECT un FROM UserNotification un
            JOIN FETCH un.user u
            WHERE un.notification.id = :notificationId
              AND un.isRead = true
            """)
    List<UserNotification> findReadUsersByNotificationId(@Param("notificationId") UUID notificationId);

    // Đếm số thông báo chưa đọc của 1 user.
    long countByUserIdAndIsReadFalse(UUID userId);

    // Đánh dấu tất cả thông báo chưa đọc của user là đã đọc
    @Modifying
    @Query("""
            UPDATE UserNotification un
            SET un.isRead = true,
                un.readAt = CURRENT_TIMESTAMP
            WHERE un.user.id = :userId
              AND un.isRead = false
            """)
    int markAllAsRead(@Param("userId") UUID userId);
}