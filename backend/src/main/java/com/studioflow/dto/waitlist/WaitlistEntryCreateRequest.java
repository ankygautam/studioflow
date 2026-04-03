package com.studioflow.dto.waitlist;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record WaitlistEntryCreateRequest(
    @NotNull UUID studioId,
    @NotNull UUID locationId,
    @NotNull UUID customerProfileId,
    @NotNull UUID serviceId,
    UUID preferredStaffProfileId,
    @FutureOrPresent LocalDate preferredDate,
    @Size(max = 5000) String notes,
    Boolean isActive
) {
}
