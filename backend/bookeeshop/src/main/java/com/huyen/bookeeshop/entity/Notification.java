package com.huyen.bookeeshop.entity;

import com.huyen.bookeeshop.enums.NotificationAudienceType;
import com.huyen.bookeeshop.enums.NotificationStatus;
import com.huyen.bookeeshop.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(updatable = false, nullable = false)
    UUID id;

    @Column(nullable = false)
    String title;

    @Column(nullable = false)
    String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationType type;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationStatus status = NotificationStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "audience_type")
    NotificationAudienceType audienceType;

    @Column(name = "target_role")
    String targetRole;

    @Column(name = "scheduled_at")
    LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    LocalDateTime sentAt;

    @Column(name = "ref_id")
    String refId;

    @Builder.Default
    @Column(nullable = false)
    Boolean deleted = false;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    List<UserNotification> userNotifications;


}
