package com.studioflow.dto.consent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ConsentFormTemplateCreateRequest(
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String title,
    @Size(max = 4000) String description,
    @NotBlank String content,
    Boolean isActive
) {
}
