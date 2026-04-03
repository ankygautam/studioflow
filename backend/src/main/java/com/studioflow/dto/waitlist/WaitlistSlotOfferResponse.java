package com.studioflow.dto.waitlist;

import com.studioflow.enums.WaitlistOfferStatus;
import java.time.Instant;
import java.util.UUID;

public record WaitlistSlotOfferResponse(
    UUID id,
    UUID studioId,
    UUID waitlistEntryId,
    UUID cancelledAppointmentId,
    UUID convertedAppointmentId,
    UUID customerProfileId,
    String customerName,
    WaitlistOfferStatus status,
    Instant expiresAt,
    Instant respondedAt,
    Instant createdAt,
    Instant updatedAt
) {
}
