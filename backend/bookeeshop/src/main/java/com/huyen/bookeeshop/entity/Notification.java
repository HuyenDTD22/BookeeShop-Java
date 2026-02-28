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
    String content;

    @Column(nullable = false)
    String type;

    @Column(nullable = false)
    String status;

    @Column(nullable = false)
    Boolean deleted = false;

    @Column(name = "send_at")
    LocalDateTime sendAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @OneToMany(mappedBy = "notification")
    List<UserNotification> userNotifications;


}
