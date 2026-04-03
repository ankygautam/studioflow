package com.studioflow.dto.staff;

import com.studioflow.enums.StaffStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record StaffUpdateRequest(
    @NotNull UUID userId,
    @NotNull UUID studioId,
    UUID primaryLocationId,
    @NotBlank @Size(max = 160) String displayName,
    @Size(max = 120) String jobTitle,
    @Size(max = 40) String phone,
    @Size(max = 5000) String bio,
    @Size(max = 2000) String avatarUrl,
    @DecimalMin(value = "0.00") @DecimalMax(value = "100.00") BigDecimal commissionRate,
    @NotNull StaffStatus status
) {
}
