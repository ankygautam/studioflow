package com.studioflow.dto.onboarding;

import java.util.UUID;

public record StudioOnboardingResponse(
    UUID studioId,
    String studioName,
    UUID locationId,
    String locationName,
    String locationSlug,
    boolean onboardingCompleted
) {
}
