package com.studioflow.dto.consent;

import com.studioflow.enums.ConsentFormStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record ConsentFormSubmissionCreateRequest(
    @NotNull UUID templateId,
    @NotNull UUID studioId,
    @NotNull UUID customerProfileId,
    UUID appointmentId,
    @NotNull ConsentFormStatus status,
    Instant signedAt,
    @Size(max = 2000) String signatureImageUrl
) {
}
