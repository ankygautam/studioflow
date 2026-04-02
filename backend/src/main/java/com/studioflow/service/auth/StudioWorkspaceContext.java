package com.studioflow.service.auth;

import java.util.UUID;

public record StudioWorkspaceContext(
    UUID studioId,
    String studioName,
    UUID locationId,
    boolean onboardingCompleted
) {

    public static StudioWorkspaceContext empty() {
        return new StudioWorkspaceContext(null, null, null, false);
    }
}
