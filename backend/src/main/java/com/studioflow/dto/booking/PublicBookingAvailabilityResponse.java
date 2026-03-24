package com.studioflow.dto.booking;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PublicBookingAvailabilityResponse(
    UUID studioId,
    UUID locationId,
    String studioSlug,
    UUID serviceId,
    UUID staffProfileId,
    LocalDate date,
    List<PublicBookingTimeSlot> slots
) {
}
