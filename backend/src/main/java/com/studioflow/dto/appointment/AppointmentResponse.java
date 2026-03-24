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
    UUID locationId,
    UUID customerProfileId,
    UUID staffProfileId,
    UUID serviceId,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    AppointmentStatus status,
    String notes,
    AppointmentSource source,
    Instant createdAt,
    Instant updatedAt,
    String customerName,
    String staffName,
    String serviceName,
    String locationName,
    Instant bookingConfirmationSentAt,
    Instant reminderSentAt
) {
}
