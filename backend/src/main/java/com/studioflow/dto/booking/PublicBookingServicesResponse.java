package com.studioflow.dto.booking;

import java.util.List;
import java.util.UUID;

public record PublicBookingServicesResponse(
    UUID studioId,
    String studioSlug,
    String studioName,
    String timezone,
    List<PublicBookingLocationItem> locations,
    List<PublicBookingServiceItem> services
) {
}
