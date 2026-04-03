package com.studioflow.service.communication;

import com.studioflow.config.communication.CommunicationProperties;
import com.studioflow.entity.Appointment;
import com.studioflow.dto.settings.ReminderDispatchResponse;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.service.NotificationService;
import com.studioflow.service.ReminderSettingsService;
import com.studioflow.service.auth.CurrentUserService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReminderDispatchService {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Edmonton");
    private static final Logger LOGGER = LoggerFactory.getLogger(ReminderDispatchService.class);

    private final CommunicationProperties communicationProperties;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final ReminderSettingsService reminderSettingsService;
    private final CurrentUserService currentUserService;

    @Scheduled(cron = "${studioflow.communication.reminders.cron:0 */30 * * * *}")
    @Transactional
    public void dispatchUpcomingAppointmentReminders() {
        dispatchUpcomingAppointmentReminders(null);
    }

    @Transactional
    public ReminderDispatchResponse dispatchUpcomingAppointmentReminders(UUID studioId) {
        if (!communicationProperties.getReminders().isEnabled()) {
            return new ReminderDispatchResponse(0, List.of());
        }

        try {
            LocalDate today = LocalDate.now(DEFAULT_ZONE);
            UUID authorizedStudioId = studioId != null ? currentUserService.requireStudioAccess(studioId) : null;
            List<Appointment> baseAppointments = resolveAppointments(today, authorizedStudioId);
            List<Integer> encounteredOffsets = new ArrayList<>();
            long dispatched = 0;

            for (Appointment appointment : baseAppointments) {
                if (!isReminderEligible(appointment)) {
                    continue;
                }

                List<Integer> reminderOffsets = reminderSettingsService.parseReminderOffsets(appointment.getStudio());
                reminderOffsets.forEach((offset) -> {
                    if (!encounteredOffsets.contains(offset)) {
                        encounteredOffsets.add(offset);
                    }
                });

                for (Integer reminderOffsetHours : reminderOffsets) {
                    if (!isReminderDueForOffset(appointment, reminderOffsetHours)) {
                        continue;
                    }

                    Instant duplicateThreshold = Instant.now().minusSeconds(60L * 90L);
                    if (notificationService.hasRecentReminderNotification(appointment, reminderOffsetHours, duplicateThreshold)) {
                        continue;
                    }

                    if (notificationService.notifyAppointmentReminder(appointment, reminderOffsetHours, duplicateThreshold)) {
                        dispatched += 1;
                    }
                }
            }

            if (dispatched > 0) {
                LOGGER.info("Dispatched {} appointment reminder notification batches.", dispatched);
            }

            return new ReminderDispatchResponse(
                dispatched,
                encounteredOffsets.stream().sorted(java.util.Comparator.reverseOrder()).toList()
            );
        } catch (Exception exception) {
            LOGGER.error("Reminder dispatch failed: {}", exception.getMessage(), exception);
            return new ReminderDispatchResponse(0, List.of());
        }
    }

    private boolean isReminderEligible(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatus.BOOKED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            return false;
        }

        if (!Boolean.TRUE.equals(appointment.getStudio().getAppointmentReminderEnabled())) {
            return false;
        }

        return reminderSettingsService.hasAnyReminderChannelEnabled(appointment.getStudio());
    }

    private boolean isReminderDueForOffset(Appointment appointment, int reminderOffsetHours) {
        ZoneId zoneId = resolveStudioZone(appointment);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        LocalDateTime now = LocalDateTime.now(zoneId);
        LocalDateTime windowStart = now.plusHours(reminderOffsetHours).minusMinutes(45);
        LocalDateTime windowEnd = now.plusHours(reminderOffsetHours);

        return appointmentDateTime.isAfter(now)
            && (appointmentDateTime.isEqual(windowStart) || appointmentDateTime.isAfter(windowStart))
            && (appointmentDateTime.isEqual(windowEnd) || appointmentDateTime.isBefore(windowEnd));
    }

    private ZoneId resolveStudioZone(Appointment appointment) {
        try {
            return ZoneId.of(appointment.getStudio().getTimezone());
        } catch (Exception ignored) {
            return DEFAULT_ZONE;
        }
    }

    private List<Appointment> resolveAppointments(LocalDate today, UUID studioId) {
        int maxOffsetHours = studioId == null ? 168 : 168;
        LocalDate horizon = today.plusDays(Math.max(1, (maxOffsetHours + 23) / 24));
        List<Appointment> appointments = appointmentRepository.findByAppointmentDateBetween(today, horizon);

        if (studioId == null) {
            return appointments;
        }

        return appointments.stream()
            .filter((appointment) -> appointment.getStudio().getId().equals(studioId))
            .toList();
    }
}
