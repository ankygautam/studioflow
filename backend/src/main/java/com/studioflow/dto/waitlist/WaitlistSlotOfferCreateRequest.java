package com.studioflow.dto.waitlist;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record WaitlistSlotOfferCreateRequest(
    @NotNull UUID cancelledAppointmentId,
    Instant expiresAt,
    @NotNull UUID waitlistEntryId
) {
}
