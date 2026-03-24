package com.studioflow.dto.service;

import com.studioflow.enums.ServiceCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record UpdateServiceRequest(
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String name,
    @NotNull ServiceCategory category,
    @Size(max = 5000) String description,
    @NotNull @Positive Integer durationMinutes,
    @NotNull @DecimalMin(value = "0.00") BigDecimal price,
    @NotNull Boolean depositRequired,
    @DecimalMin(value = "0.00") BigDecimal depositAmount,
    Boolean isActive
) {
}
