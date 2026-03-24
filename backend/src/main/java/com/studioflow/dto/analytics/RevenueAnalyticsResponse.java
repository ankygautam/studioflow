package com.studioflow.dto.analytics;

import java.math.BigDecimal;
import java.util.List;

public record RevenueAnalyticsResponse(
    BigDecimal totalRevenue,
    BigDecimal totalDeposits,
    long paidCount,
    long pendingCount,
    List<RevenueTrendPoint> trend
) {
}
