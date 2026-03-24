package com.studioflow.dto.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PublicBookingCreateRequest(
    @NotNull UUID studioId,
    @NotNull UUID locationId,
    @NotNull UUID serviceId,
    @NotNull UUID staffProfileId,
    @NotNull LocalDate appointmentDate,
    @NotNull LocalTime startTime,
    @NotBlank String fullName,
    @Email String email,
    @NotBlank String phone,
    String notes
) {
}
