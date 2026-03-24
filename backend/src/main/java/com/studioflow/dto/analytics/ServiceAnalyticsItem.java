package com.studioflow.dto.analytics;

import com.studioflow.enums.ServiceCategory;
import java.math.BigDecimal;
import java.util.UUID;

public record ServiceAnalyticsItem(
    UUID serviceId,
    String serviceName,
    ServiceCategory category,
    long bookingCount,
    BigDecimal totalRevenue
) {
}
