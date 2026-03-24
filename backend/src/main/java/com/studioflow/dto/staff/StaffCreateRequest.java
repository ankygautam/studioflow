package com.studioflow.dto.staff;

import com.studioflow.enums.StaffStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record StaffCreateRequest(
    @NotNull UUID userId,
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String displayName,
    @Size(max = 120) String jobTitle,
    @Size(max = 40) String phone,
    @Size(max = 5000) String bio,
    @Size(max = 2000) String avatarUrl,
    @NotNull StaffStatus status
) {
}
