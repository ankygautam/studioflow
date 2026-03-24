package com.studioflow.dto.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateClientRequest(
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String fullName,
    @Email @Size(max = 160) String email,
    @Size(max = 40) String phone,
    LocalDate dateOfBirth,
    @Size(max = 5000) String notes,
    Boolean isActive
) {
}
