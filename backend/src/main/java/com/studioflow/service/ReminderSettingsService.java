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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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
        List<Integer> reminderOffsets = normalizeReminderOffsets(
            request.appointmentReminderOffsetsHours(),
            request.appointmentReminderHoursBefore()
        );

        studio.setAppointmentReminderEnabled(request.appointmentReminderEnabled());
        studio.setAppointmentReminderHoursBefore(reminderOffsets.get(0));
        studio.setAppointmentReminderOffsetsCsv(serializeReminderOffsets(reminderOffsets));
        studio.setAppointmentReminderInAppEnabled(normalizeReminderToggle(request.appointmentReminderInAppEnabled()));
        studio.setAppointmentReminderEmailEnabled(normalizeReminderToggle(request.appointmentReminderEmailEnabled()));
        studio.setAppointmentReminderSmsEnabled(normalizeReminderToggle(request.appointmentReminderSmsEnabled()));

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
                + serializeReminderOffsets(reminderOffsets)
                + "-hour schedule across channels: in-app="
                + (isReminderInAppEnabled(savedStudio) ? "on" : "off")
                + ", email="
                + (isReminderEmailEnabled(savedStudio) ? "on" : "off")
                + ", sms="
                + (isReminderSmsEnabled(savedStudio) ? "on" : "off")
                + "."
        );

        return toResponse(savedStudio);
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private ReminderSettingsResponse toResponse(Studio studio) {
        List<Integer> reminderOffsets = parseReminderOffsets(studio);
        return new ReminderSettingsResponse(
            studio.getId(),
            normalizeReminderToggle(studio.getAppointmentReminderEnabled()),
            reminderOffsets.get(0),
            reminderOffsets,
            isReminderInAppEnabled(studio),
            isReminderEmailEnabled(studio),
            isReminderSmsEnabled(studio)
        );
    }

    public boolean hasAnyReminderChannelEnabled(Studio studio) {
        return isReminderInAppEnabled(studio) || isReminderEmailEnabled(studio) || isReminderSmsEnabled(studio);
    }

    public boolean isReminderInAppEnabled(Studio studio) {
        return normalizeReminderToggle(studio.getAppointmentReminderInAppEnabled());
    }

    public boolean isReminderEmailEnabled(Studio studio) {
        return normalizeReminderToggle(studio.getAppointmentReminderEmailEnabled());
    }

    public boolean isReminderSmsEnabled(Studio studio) {
        return normalizeReminderToggle(studio.getAppointmentReminderSmsEnabled());
    }

    public List<Integer> parseReminderOffsets(Studio studio) {
        String csv = studio.getAppointmentReminderOffsetsCsv();
        if (csv == null || csv.isBlank()) {
            Integer fallback = studio.getAppointmentReminderHoursBefore();
            return List.of(fallback != null && fallback > 0 ? fallback : 24);
        }

        List<Integer> parsedValues = csv.lines()
            .flatMap((line) -> java.util.Arrays.stream(line.split(",")))
            .map(String::trim)
            .filter((value) -> !value.isEmpty())
            .map(Integer::valueOf)
            .filter((value) -> value > 0)
            .distinct()
            .sorted(java.util.Comparator.reverseOrder())
            .toList();

        if (parsedValues.isEmpty()) {
            Integer fallback = studio.getAppointmentReminderHoursBefore();
            return List.of(fallback != null && fallback > 0 ? fallback : 24);
        }

        return parsedValues;
    }

    private List<Integer> normalizeReminderOffsets(List<Integer> requestedOffsets, Integer fallbackHoursBefore) {
        Set<Integer> values = new LinkedHashSet<>();

        if (requestedOffsets != null) {
            requestedOffsets.stream()
                .filter((value) -> value != null && value > 0)
                .forEach(values::add);
        }

        if (values.isEmpty() && fallbackHoursBefore != null && fallbackHoursBefore > 0) {
            values.add(fallbackHoursBefore);
        }

        if (values.isEmpty()) {
            values.add(24);
        }

        return values.stream()
            .sorted(java.util.Comparator.reverseOrder())
            .toList();
    }

    private String serializeReminderOffsets(List<Integer> reminderOffsets) {
        return reminderOffsets.stream()
            .map(String::valueOf)
            .collect(java.util.stream.Collectors.joining(","));
    }

    private boolean normalizeReminderToggle(Boolean value) {
        return value == null || Boolean.TRUE.equals(value);
    }
}
