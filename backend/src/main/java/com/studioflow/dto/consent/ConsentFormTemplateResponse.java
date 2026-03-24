package com.studioflow.dto.consent;

import java.time.Instant;
import java.util.UUID;

public record ConsentFormTemplateResponse(
    UUID id,
    UUID studioId,
    String studioName,
    String title,
    String description,
    String content,
    boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
