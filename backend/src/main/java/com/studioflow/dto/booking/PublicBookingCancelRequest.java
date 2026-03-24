package com.studioflow.dto.booking;

import jakarta.validation.constraints.NotBlank;

public record PublicBookingCancelRequest(
    @NotBlank String manageToken
) {
}
