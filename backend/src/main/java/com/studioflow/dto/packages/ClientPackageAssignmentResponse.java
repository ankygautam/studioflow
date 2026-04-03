package com.studioflow.dto.packages;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ClientPackageAssignmentResponse(
    UUID id,
    UUID studioId,
    UUID customerProfileId,
    String customerName,
    UUID prepaidPackageId,
    String packageName,
    Integer totalSessions,
    Integer remainingSessions,
    LocalDate expiresAt,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
