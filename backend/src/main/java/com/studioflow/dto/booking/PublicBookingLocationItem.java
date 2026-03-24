package com.studioflow.dto.booking;

import java.util.UUID;

public record PublicBookingLocationItem(
    UUID id,
    String name,
    String slug,
    String city,
    String provinceOrState,
    String timezone
) {
}
