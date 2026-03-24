package com.studioflow.dto.auth;

public record AuthResponse(
    String token,
    AuthUserResponse user
) {
}
