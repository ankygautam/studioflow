package com.studioflow.dto.appointment;

import com.studioflow.enums.AppointmentSource;
import com.studioflow.enums.AppointmentStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentResponse(
    UUID id,
    UUID studioId,
    String studioName,
    UUID customerProfileId,
    String customerName,
    UUID staffProfileId,
    String staffDisplayName,
    UUID serviceId,
    String serviceName,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    AppointmentStatus status,
    String notes,
    AppointmentSource source,
    Instant createdAt,
    Instant updatedAt
) {
}
