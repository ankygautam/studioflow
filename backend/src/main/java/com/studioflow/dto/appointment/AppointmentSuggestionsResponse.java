package com.studioflow.dto.appointment;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AppointmentSuggestionsResponse(
    UUID studioId,
    UUID locationId,
    UUID serviceId,
    UUID staffProfileId,
    LocalDate date,
    List<AppointmentSuggestionItem> suggestions
) {
}
