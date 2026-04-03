package com.studioflow.dto.packages;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ClientPackageAssignmentCreateRequest(
    @NotNull UUID studioId,
    @NotNull UUID customerProfileId,
    @NotNull UUID prepaidPackageId
) {
}
