package com.studioflow.dto.notification;

import com.studioflow.enums.NotificationType;
import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    String title,
    String message,
    NotificationType type,
    Boolean isRead,
    Instant createdAt,
    UUID appointmentId,
    String actionUrl
) {
}
