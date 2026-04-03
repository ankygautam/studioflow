package com.studioflow.dto.settings;

import java.util.UUID;

public record ReminderSettingsResponse(
    UUID studioId,
    Boolean appointmentReminderEnabled,
    Integer appointmentReminderHoursBefore
) {
}
