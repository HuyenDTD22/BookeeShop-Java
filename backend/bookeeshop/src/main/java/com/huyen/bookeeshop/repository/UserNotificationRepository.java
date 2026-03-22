package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.UserNotification;
import com.huyen.bookeeshop.enums.NotificationType;
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

    @Query("""
            SELECT un FROM UserNotification un
            JOIN FETCH un.user u
            WHERE un.notification.id = :notificationId
              AND un.isRead = true
            """)
    List<UserNotification> findReadUsersByNotificationId(@Param("notificationId") UUID notificationId);

    long countByUserIdAndIsReadFalse(UUID userId);

    @Modifying
    @Query("""
            UPDATE UserNotification un
            SET un.isRead = true,
                un.readAt = CURRENT_TIMESTAMP
            WHERE un.user.id = :userId
              AND un.isRead = false
            """)
    int markAllAsRead(@Param("userId") UUID userId);

    @Query("""
    SELECT un FROM UserNotification un
    JOIN FETCH un.notification n
    WHERE un.user.id = :userId
      AND (:type IS NULL OR n.type = :type)
    ORDER BY n.createdAt DESC
""")
    Page<UserNotification> findByUserIdAndType(
            @Param("userId") UUID userId,
            @Param("type") NotificationType type,
            Pageable pageable
    );
}