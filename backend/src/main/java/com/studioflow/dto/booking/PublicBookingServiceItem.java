package com.studioflow.dto.booking;

import com.studioflow.enums.ServiceCategory;
import java.math.BigDecimal;
import java.util.UUID;

public record PublicBookingServiceItem(
    UUID id,
    String name,
    ServiceCategory category,
    String description,
    Integer durationMinutes,
    BigDecimal price,
    Boolean depositRequired,
    BigDecimal depositAmount
) {
}
