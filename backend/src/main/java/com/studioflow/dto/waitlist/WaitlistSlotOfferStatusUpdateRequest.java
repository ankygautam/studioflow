package com.studioflow.dto.waitlist;

import com.studioflow.enums.WaitlistOfferStatus;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record WaitlistSlotOfferStatusUpdateRequest(
    UUID convertedAppointmentId,
    @NotNull WaitlistOfferStatus status
) {
}
