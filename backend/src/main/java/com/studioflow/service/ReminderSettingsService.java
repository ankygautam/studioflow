package com.studioflow.service;

import com.studioflow.dto.settings.ReminderSettingsResponse;
import com.studioflow.dto.settings.ReminderSettingsUpdateRequest;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReminderSettingsService {

    private final CurrentUserService currentUserService;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public ReminderSettingsResponse getReminderSettings(UUID studioId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        Studio studio = findStudio(currentUserService.requireStudioAccess(studioId));
        return toResponse(studio);
    }

    public ReminderSettingsResponse updateReminderSettings(ReminderSettingsUpdateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        studio.setAppointmentReminderEnabled(request.appointmentReminderEnabled());
        studio.setAppointmentReminderHoursBefore(request.appointmentReminderHoursBefore());

        Studio savedStudio = studioRepository.save(studio);
        auditLogService.log(
            AuditEntityType.SETTINGS,
            savedStudio.getId(),
            AuditActionType.UPDATED,
            savedStudio.getId(),
            null,
            "Reminder settings updated",
            "Appointment reminders were updated to "
                + (Boolean.TRUE.equals(savedStudio.getAppointmentReminderEnabled()) ? "enabled" : "disabled")
                + " with a "
                + savedStudio.getAppointmentReminderHoursBefore()
                + "-hour lead time."
        );

        return toResponse(savedStudio);
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private ReminderSettingsResponse toResponse(Studio studio) {
        return new ReminderSettingsResponse(
            studio.getId(),
            studio.getAppointmentReminderEnabled(),
            studio.getAppointmentReminderHoursBefore()
        );
    }
}
