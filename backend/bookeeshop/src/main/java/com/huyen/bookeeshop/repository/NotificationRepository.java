package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Notification;
import com.huyen.bookeeshop.enums.NotificationStatus;
import com.huyen.bookeeshop.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, UUID>, JpaSpecificationExecutor<Notification> {

    Optional<Notification> findByIdAndDeletedFalse(UUID id);

    @Query("""
            SELECT n FROM Notification n
            WHERE n.status = :status
              AND n.scheduledAt IS NOT NULL
              AND n.scheduledAt <= :now
              AND n.deleted = false
            """)
    List<Notification> findPendingScheduled(@Param("status") NotificationStatus status, @Param("now") LocalDateTime now);

    boolean existsByRefIdAndTypeAndDeletedFalse(String refId, NotificationType type);
}