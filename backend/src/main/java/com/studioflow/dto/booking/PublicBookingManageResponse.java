package com.studioflow.dto.booking;

import com.studioflow.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PublicBookingManageResponse(
    String message,
    String bookingReference,
    UUID appointmentId,
    UUID studioId,
    String studioSlug,
    String studioName,
    String customerName,
    String serviceName,
    String staffName,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    AppointmentStatus status
) {
}
