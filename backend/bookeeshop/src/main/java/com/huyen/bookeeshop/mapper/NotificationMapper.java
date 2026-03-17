package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.NotificationClientResponse;
import com.huyen.bookeeshop.dto.response.NotificationReaderResponse;
import com.huyen.bookeeshop.dto.response.NotificationResponse;
import com.huyen.bookeeshop.entity.Notification;
import com.huyen.bookeeshop.entity.UserNotification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "totalRecipients", expression = "java(notification.getUserNotifications() != null ? notification.getUserNotifications().size() : 0)")
    @Mapping(target = "readCount", expression = "java(notification.getUserNotifications() != null ? (int) notification.getUserNotifications().stream().filter(un -> Boolean.TRUE.equals(un.getIsRead())).count() : 0)")
    NotificationResponse toNotificationResponse(Notification notification);

    @Mapping(source = "notification.id",        target = "id")
    @Mapping(source = "notification.title",     target = "title")
    @Mapping(source = "notification.content",   target = "content")
    @Mapping(source = "notification.type",      target = "type")
    @Mapping(source = "notification.refId",     target = "refId")
    @Mapping(source = "notification.sentAt",    target = "sentAt")
    @Mapping(source = "notification.createdAt", target = "createdAt")
    @Mapping(source = "isRead",                 target = "isRead")
    @Mapping(source = "readAt",                 target = "readAt")
    NotificationClientResponse toClientNotificationResponse(UserNotification userNotification);

    @Mapping(source = "user.id",       target = "userId")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "user.avatar",   target = "avatar")
    @Mapping(source = "readAt",        target = "readAt")
    NotificationReaderResponse toNotificationReaderResponse(UserNotification userNotification);
}