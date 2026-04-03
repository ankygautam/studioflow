package com.studioflow.dto.analytics;

import java.math.BigDecimal;

public record AnalyticsOverviewResponse(
    long totalAppointments,
    long completedAppointments,
    long cancelledAppointments,
    long noShowAppointments,
    long totalClients,
    long activeStaff,
    long activeServices,
    BigDecimal totalRevenue,
    BigDecimal totalDeposits
) {
}
