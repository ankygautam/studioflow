package com.studioflow.dto.consent;

import com.studioflow.enums.ConsentFormStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ConsentFormSubmissionResponse(
    UUID id,
    UUID templateId,
    UUID studioId,
    UUID customerProfileId,
    UUID appointmentId,
    ConsentFormStatus status,
    Instant signedAt,
    String signatureImageUrl,
    Instant createdAt,
    Instant updatedAt,
    String templateTitle,
    String customerName,
    LocalDate appointmentDate,
    LocalTime appointmentStartTime,
    String serviceName
) {
}
