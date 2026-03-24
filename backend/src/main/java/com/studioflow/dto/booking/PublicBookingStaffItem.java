package com.studioflow.dto.booking;

import java.util.UUID;

public record PublicBookingStaffItem(
    UUID id,
    String displayName,
    String jobTitle,
    String bio,
    String avatarUrl
) {
}
