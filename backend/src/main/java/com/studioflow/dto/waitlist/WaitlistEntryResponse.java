package com.studioflow.dto.waitlist;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record WaitlistEntryResponse(
    UUID id,
    UUID studioId,
    UUID locationId,
    String locationName,
    UUID customerProfileId,
    String customerName,
    UUID serviceId,
    String serviceName,
    UUID preferredStaffProfileId,
    String preferredStaffName,
    LocalDate preferredDate,
    String notes,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
