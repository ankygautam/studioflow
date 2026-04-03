package com.studioflow.controller;

import com.studioflow.dto.settings.ReminderSettingsResponse;
import com.studioflow.dto.settings.ReminderSettingsUpdateRequest;
import com.studioflow.dto.settings.ReminderDispatchResponse;
import com.studioflow.service.ReminderSettingsService;
import com.studioflow.service.communication.ReminderDispatchService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/reminders")
@RequiredArgsConstructor
public class ReminderSettingsController {

    private final ReminderSettingsService reminderSettingsService;
    private final ReminderDispatchService reminderDispatchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<ReminderSettingsResponse> getReminderSettings(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(reminderSettingsService.getReminderSettings(studioId));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReminderSettingsResponse> updateReminderSettings(
        @Valid @RequestBody ReminderSettingsUpdateRequest request
    ) {
        return ResponseEntity.ok(reminderSettingsService.updateReminderSettings(request));
    }

    @PostMapping("/dispatch-now")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReminderDispatchResponse> dispatchReminderSweepNow(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(reminderDispatchService.dispatchUpcomingAppointmentReminders(studioId));
    }
}
