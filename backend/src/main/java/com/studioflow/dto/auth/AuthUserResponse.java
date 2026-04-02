package com.studioflow.dto.auth;

import com.studioflow.enums.UserRole;
import java.util.UUID;

public record AuthUserResponse(
    UUID id,
    String fullName,
    String email,
    UserRole role,
    UUID studioId,
    String studioName,
    UUID locationId,
    boolean onboardingCompleted
) {
}
