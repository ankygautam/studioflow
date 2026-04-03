package com.studioflow.dto.settings;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReminderSettingsUpdateRequest(
    @NotNull UUID studioId,
    @NotNull Boolean appointmentReminderEnabled,
    @NotNull @Min(1) @Max(168) Integer appointmentReminderHoursBefore
) {
}
