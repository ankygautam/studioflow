package com.studioflow.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequest(
    @NotBlank @Size(max = 160) String fullName,
    @NotBlank @Email @Size(max = 160) String email,
    @NotBlank @Size(min = 8, max = 120) String password
) {
}
