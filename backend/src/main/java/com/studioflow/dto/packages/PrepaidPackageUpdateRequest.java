package com.studioflow.dto.packages;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record PrepaidPackageUpdateRequest(
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String name,
    @Size(max = 5000) String description,
    @NotNull @Positive Integer sessionCount,
    @NotNull @DecimalMin(value = "0.00") BigDecimal price,
    @Positive Integer expiresAfterDays,
    Boolean isActive
) {
}
