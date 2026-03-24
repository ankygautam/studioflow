package com.studioflow.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record PublicBookingRescheduleRequest(
    @NotBlank String manageToken,
    @NotNull LocalDate appointmentDate,
    @NotNull LocalTime startTime
) {
}
