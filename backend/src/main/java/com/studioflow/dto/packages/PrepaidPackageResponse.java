package com.studioflow.dto.packages;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PrepaidPackageResponse(
    UUID id,
    UUID studioId,
    String name,
    String description,
    Integer sessionCount,
    BigDecimal price,
    Integer expiresAfterDays,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
