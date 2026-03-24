package com.studioflow.dto.onboarding;

import com.studioflow.enums.BusinessType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record StudioOnboardingRequest(
    @NotBlank @Size(max = 160) String studioName,
    @NotNull BusinessType businessType,
    @Email @Size(max = 160) String studioEmail,
    @Size(max = 40) String studioPhone,
    @NotBlank @Size(max = 160) String locationName,
    @Email @Size(max = 160) String locationEmail,
    @Size(max = 40) String locationPhone,
    @Size(max = 160) String addressLine1,
    @Size(max = 160) String addressLine2,
    @Size(max = 80) String city,
    @Size(max = 80) String provinceOrState,
    @Size(max = 20) String postalCode,
    @Size(max = 80) String country,
    @NotBlank @Size(max = 80) String timezone,
    List<StarterServiceRequest> starterServices,
    @Min(0) @Max(168) Integer bookingLeadTimeHours,
    Boolean defaultDepositRequired,
    BigDecimal defaultDepositAmount
) {
}
