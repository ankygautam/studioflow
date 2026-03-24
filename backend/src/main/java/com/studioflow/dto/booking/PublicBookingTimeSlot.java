package com.studioflow.dto.booking;

import java.time.LocalTime;

public record PublicBookingTimeSlot(
    LocalTime startTime,
    LocalTime endTime,
    String label
) {
}
