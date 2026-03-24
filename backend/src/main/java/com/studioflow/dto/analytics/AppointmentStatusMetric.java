package com.studioflow.dto.analytics;

import com.studioflow.enums.AppointmentStatus;

public record AppointmentStatusMetric(
    AppointmentStatus status,
    long count
) {
}
