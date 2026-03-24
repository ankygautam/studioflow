package com.studioflow.dto.booking;

import com.studioflow.enums.AppointmentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PublicBookingConfirmationResponse(
    UUID appointmentId,
    UUID studioId,
    String studioSlug,
    String studioName,
    String customerName,
    String customerEmail,
    String customerPhone,
    String serviceName,
    String staffName,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    AppointmentStatus status,
    Boolean depositRequired,
    BigDecimal depositAmount
) {
}
