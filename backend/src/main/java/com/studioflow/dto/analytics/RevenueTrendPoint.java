package com.studioflow.dto.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueTrendPoint(
    LocalDate date,
    BigDecimal revenue,
    BigDecimal deposits
) {
}
