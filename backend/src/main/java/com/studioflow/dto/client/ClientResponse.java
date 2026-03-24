package com.studioflow.dto.client;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ClientResponse(
    UUID id,
    UUID studioId,
    String studioName,
    String fullName,
    String email,
    String phone,
    LocalDate dateOfBirth,
    String notes,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
