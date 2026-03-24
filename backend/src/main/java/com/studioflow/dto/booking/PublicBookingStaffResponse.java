package com.studioflow.dto.booking;

import java.util.List;
import java.util.UUID;

public record PublicBookingStaffResponse(
    UUID studioId,
    UUID locationId,
    String studioSlug,
    UUID serviceId,
    List<PublicBookingStaffItem> staff
) {
}
