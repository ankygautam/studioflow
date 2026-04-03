package com.studioflow.service.communication;

import com.studioflow.config.communication.CommunicationProperties;
import com.studioflow.entity.Appointment;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.service.NotificationService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
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

    @Scheduled(cron = "${studioflow.communication.reminders.cron:0 */30 * * * *}")
    @Transactional
    public void dispatchUpcomingAppointmentReminders() {
        if (!communicationProperties.getReminders().isEnabled()) {
            return;
        }

        try {
            LocalDate today = LocalDate.now(DEFAULT_ZONE);
            LocalDate tomorrow = today.plusDays(1);
            Instant duplicateThreshold = Instant.now().minusSeconds(60L * 60L * 12L);

            List<Appointment> appointments = appointmentRepository.findByAppointmentDateBetween(today, tomorrow);
            long dispatched = appointments.stream()
                .filter(this::isReminderEligible)
                .filter((appointment) -> !notificationService.hasRecentReminderNotification(appointment, duplicateThreshold))
                .filter((appointment) -> notificationService.notifyAppointmentReminder(appointment, duplicateThreshold))
                .count();

            if (dispatched > 0) {
                LOGGER.info("Dispatched {} appointment reminder notification batches.", dispatched);
            }
        } catch (Exception exception) {
            LOGGER.error("Reminder dispatch failed: {}", exception.getMessage(), exception);
        }
    }

    private boolean isReminderEligible(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatus.BOOKED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            return false;
        }

        if (!Boolean.TRUE.equals(appointment.getStudio().getAppointmentReminderEnabled())) {
            return false;
        }

        ZoneId zoneId = resolveStudioZone(appointment);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        LocalDateTime now = LocalDateTime.now(zoneId);
        int reminderWindowHours = resolveReminderWindowHours(appointment);

        return appointmentDateTime.isAfter(now) && appointmentDateTime.isBefore(now.plusHours(reminderWindowHours));
    }

    private ZoneId resolveStudioZone(Appointment appointment) {
        try {
            return ZoneId.of(appointment.getStudio().getTimezone());
        } catch (Exception ignored) {
            return DEFAULT_ZONE;
        }
    }

    private int resolveReminderWindowHours(Appointment appointment) {
        Integer configuredValue = appointment.getStudio().getAppointmentReminderHoursBefore();
        if (configuredValue == null || configuredValue < 1) {
            return 24;
        }

        return configuredValue;
    }
}
