package com.studioflow.dto.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record LocationUpdateRequest(
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String name,
    @Size(max = 160) String slug,
    @Size(max = 40) String phone,
    @Size(max = 160) String email,
    @Size(max = 160) String addressLine1,
    @Size(max = 160) String addressLine2,
    @Size(max = 80) String city,
    @Size(max = 80) String provinceOrState,
    @Size(max = 20) String postalCode,
    @Size(max = 80) String country,
    @NotBlank @Size(max = 80) String timezone,
    Boolean isActive
) {
}
