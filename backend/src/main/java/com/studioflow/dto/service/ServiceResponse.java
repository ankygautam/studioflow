package com.studioflow.dto.service;

import com.studioflow.enums.ServiceCategory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ServiceResponse(
    UUID id,
    UUID studioId,
    String studioName,
    String name,
    ServiceCategory category,
    String description,
    Integer durationMinutes,
    BigDecimal price,
    Boolean depositRequired,
    BigDecimal depositAmount,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
