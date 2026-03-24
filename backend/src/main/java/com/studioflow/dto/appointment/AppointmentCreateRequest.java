package com.studioflow.dto.appointment;

import com.studioflow.enums.AppointmentSource;
import com.studioflow.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentCreateRequest(
    @NotNull UUID studioId,
    @NotNull UUID locationId,
    @NotNull UUID customerProfileId,
    @NotNull UUID staffProfileId,
    @NotNull UUID serviceId,
    @NotNull LocalDate appointmentDate,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime,
    @NotNull AppointmentStatus status,
    @Size(max = 5000) String notes,
    @NotNull AppointmentSource source
) {
}
