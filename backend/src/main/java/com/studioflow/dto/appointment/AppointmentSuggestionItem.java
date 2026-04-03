package com.studioflow.dto.appointment;

import java.time.LocalTime;

public record AppointmentSuggestionItem(
    LocalTime startTime,
    LocalTime endTime,
    String label,
    String reason
) {
}
