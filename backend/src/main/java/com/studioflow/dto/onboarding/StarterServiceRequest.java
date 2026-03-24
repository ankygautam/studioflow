package com.studioflow.dto.onboarding;

import com.studioflow.enums.ServiceCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record StarterServiceRequest(
    @NotBlank @Size(max = 160) String name,
    @NotNull ServiceCategory category,
    @Min(15) Integer durationMinutes,
    @DecimalMin("0.0") BigDecimal price
) {
}
