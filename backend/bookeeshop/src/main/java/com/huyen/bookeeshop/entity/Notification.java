package com.huyen.bookeeshop.entity;

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
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    UUID id;

    @Column(name = "content", nullable = false)
    String content;

    @Column(name = "type", nullable = false)
    String type;

    @Column(name = "status", nullable = false)
    String status;

    @Column(name = "deleted", nullable = false)
    Boolean deleted;

    @Column(name = "send_at")
    LocalDateTime sendAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @OneToMany(mappedBy = "notification")
    List<UserNotification> userNotifications;


}
