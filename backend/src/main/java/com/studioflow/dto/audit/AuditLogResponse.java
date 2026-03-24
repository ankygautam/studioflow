package com.studioflow.dto.audit;

import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
    UUID id,
    UUID studioId,
    UUID locationId,
    String locationName,
    UUID actorUserId,
    String actorName,
    UserRole actorRole,
    AuditEntityType entityType,
    UUID entityId,
    AuditActionType actionType,
    String title,
    String description,
    String metadataJson,
    Instant createdAt
) {
}
