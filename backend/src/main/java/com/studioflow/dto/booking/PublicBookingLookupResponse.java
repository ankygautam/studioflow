package com.studioflow.dto.booking;

import com.studioflow.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PublicBookingLookupResponse(
    String manageToken,
    String bookingReference,
    UUID appointmentId,
    UUID studioId,
    String studioSlug,
    String studioName,
    UUID locationId,
    String locationName,
    UUID serviceId,
    String serviceName,
    UUID staffProfileId,
    String staffName,
    String customerName,
    String customerEmail,
    String customerPhone,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    AppointmentStatus status
) {
}
