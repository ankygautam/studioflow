package com.studioflow.dto.analytics;

import java.util.List;

public record AppointmentAnalyticsResponse(
    long bookingsTotal,
    long completedTotal,
    long cancelledTotal,
    long noShowTotal,
    long upcomingTotal,
    List<AppointmentStatusMetric> statusBreakdown
) {
}
