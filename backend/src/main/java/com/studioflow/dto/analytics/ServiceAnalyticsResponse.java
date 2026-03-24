package com.studioflow.dto.analytics;

import java.util.List;

public record ServiceAnalyticsResponse(
    List<ServiceAnalyticsItem> topServices
) {
}
