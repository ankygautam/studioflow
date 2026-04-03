package com.studioflow.dto.settings;

import java.util.List;

public record ReminderDispatchResponse(
    long dispatchedCount,
    List<Integer> reminderOffsetsHours
) {
}
