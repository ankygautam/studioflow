package com.studioflow.dto.staff;

import com.studioflow.enums.StaffStatus;
import java.time.Instant;
import java.util.UUID;

public record StaffResponse(
    UUID id,
    UUID userId,
    String userFullName,
    UUID studioId,
    String studioName,
    String displayName,
    String jobTitle,
    String phone,
    String bio,
    String avatarUrl,
    StaffStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
