package com.studioflow.dto.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PublicBookingLookupRequest(
    @NotBlank String bookingReference,
    @Email String email,
    String phone
) {
}
