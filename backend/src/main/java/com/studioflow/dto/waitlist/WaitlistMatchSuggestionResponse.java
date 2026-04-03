package com.studioflow.dto.waitlist;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record WaitlistMatchSuggestionResponse(
    UUID waitlistEntryId,
    UUID customerProfileId,
    String customerName,
    UUID locationId,
    String locationName,
    UUID serviceId,
    String serviceName,
    UUID preferredStaffProfileId,
    String preferredStaffName,
    LocalDate preferredDate,
    LocalTime preferredStartTime,
    LocalTime preferredEndTime,
    String notes,
    List<String> matchReasons,
    Instant createdAt
) {
}
