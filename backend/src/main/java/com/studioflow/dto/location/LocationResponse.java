package com.studioflow.dto.location;

import java.time.Instant;
import java.util.UUID;

public record LocationResponse(
    UUID id,
    UUID studioId,
    String name,
    String slug,
    String phone,
    String email,
    String addressLine1,
    String addressLine2,
    String city,
    String provinceOrState,
    String postalCode,
    String country,
    String timezone,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
