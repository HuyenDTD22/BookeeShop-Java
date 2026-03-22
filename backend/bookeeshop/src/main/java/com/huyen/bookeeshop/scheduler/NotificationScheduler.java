package com.huyen.bookeeshop.scheduler;

import com.huyen.bookeeshop.entity.Notification;
import com.huyen.bookeeshop.enums.NotificationStatus;
import com.huyen.bookeeshop.repository.NotificationRepository;
import com.huyen.bookeeshop.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationScheduler {

    NotificationRepository notificationRepository;
    NotificationService    notificationService;

    /**
     * Run each 60 seconds.
     * Poll DB find notification SCHEDULED arrived or passed scheduledAt → dispatch.
     */
    @Scheduled(fixedDelay = 60_000)
    public void processScheduledNotifications() {
        LocalDateTime now = LocalDateTime.now();

        List<Notification> pending = notificationRepository
                .findPendingScheduled(NotificationStatus.SCHEDULED, now);

        if (pending.isEmpty()) {
            return;
        }

        for (Notification notification : pending) {
            try {
                notificationService.dispatchScheduled(notification);
            } catch (Exception e) {
                log.error("Failed to dispatch scheduled notification [{}]: {}",
                        notification.getId(), e.getMessage(), e);
            }
        }
    }
}