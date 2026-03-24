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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReminderDispatchService {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Edmonton");

    private final CommunicationProperties communicationProperties;
    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "${studioflow.communication.reminders.cron:0 */30 * * * *}")
    @Transactional
    public void dispatchUpcomingAppointmentReminders() {
        if (!communicationProperties.getReminders().isEnabled()) {
            return;
        }

        LocalDate today = LocalDate.now(DEFAULT_ZONE);
        LocalDate tomorrow = today.plusDays(1);
        Instant duplicateThreshold = Instant.now().minusSeconds(60L * 60L * 12L);

        List<Appointment> appointments = appointmentRepository.findByAppointmentDateBetween(today, tomorrow);
        appointments.stream()
            .filter(this::isReminderEligible)
            .filter((appointment) -> !notificationService.hasRecentReminderNotification(appointment, duplicateThreshold))
            .forEach((appointment) -> notificationService.notifyAppointmentReminder(appointment, duplicateThreshold));
    }

    private boolean isReminderEligible(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatus.BOOKED && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            return false;
        }

        ZoneId zoneId = resolveStudioZone(appointment);
        LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
        LocalDateTime now = LocalDateTime.now(zoneId);

        return appointmentDateTime.isAfter(now) && appointmentDateTime.isBefore(now.plusHours(24));
    }

    private ZoneId resolveStudioZone(Appointment appointment) {
        try {
            return ZoneId.of(appointment.getStudio().getTimezone());
        } catch (Exception ignored) {
            return DEFAULT_ZONE;
        }
    }
}
