package com.studioflow.service.communication;

import com.studioflow.dto.communication.AppointmentCommunicationContent;
import com.studioflow.dto.communication.DeliveryAttemptResult;
import com.studioflow.dto.communication.EmailMessage;
import com.studioflow.dto.communication.SmsMessage;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CommunicationLog;
import com.studioflow.enums.CommunicationEventType;
import com.studioflow.enums.CommunicationChannel;
import com.studioflow.enums.CommunicationDeliveryStatus;
import com.studioflow.repository.CommunicationLogRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationDeliveryService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationDeliveryService.class);

    private final EmailService emailService;
    private final SmsService smsService;
    private final AppointmentCommunicationFactory appointmentCommunicationFactory;
    private final CommunicationLogRepository communicationLogRepository;

    public void sendBookingConfirmation(Appointment appointment) {
        sendAppointmentCommunication(appointment, CommunicationEventType.BOOKING_CONFIRMED);
    }

    public boolean sendAppointmentReminder(Appointment appointment) {
        return sendAppointmentReminder(appointment, null, true, true);
    }

    public boolean sendAppointmentReminder(Appointment appointment, Integer reminderOffsetHours) {
        return sendAppointmentReminder(appointment, reminderOffsetHours, true, true);
    }

    public boolean sendAppointmentReminder(
        Appointment appointment,
        Integer reminderOffsetHours,
        boolean emailEnabled,
        boolean smsEnabled
    ) {
        if (!emailEnabled && !smsEnabled) {
            return false;
        }

        if (hasRecentSuccessfulReminderDelivery(appointment, reminderOffsetHours, Instant.now().minusSeconds(60L * 90L))) {
            return false;
        }

        sendAppointmentCommunication(appointment, CommunicationEventType.APPOINTMENT_REMINDER, reminderOffsetHours, emailEnabled, smsEnabled);
        return true;
    }

    public void sendBookingRescheduledConfirmation(Appointment appointment) {
        sendAppointmentCommunication(appointment, CommunicationEventType.BOOKING_RESCHEDULED);
    }

    public void sendBookingCancelledConfirmation(Appointment appointment) {
        sendAppointmentCommunication(appointment, CommunicationEventType.BOOKING_CANCELLED);
    }

    private void sendAppointmentCommunication(Appointment appointment, CommunicationEventType eventType) {
        sendAppointmentCommunication(appointment, eventType, null, true, true);
    }

    private void sendAppointmentCommunication(
        Appointment appointment,
        CommunicationEventType eventType,
        Integer reminderOffsetHours,
        boolean emailEnabled,
        boolean smsEnabled
    ) {
        AppointmentCommunicationContent content = appointmentCommunicationFactory.build(appointment, eventType);
        String email = appointment.getCustomerProfile().getEmail();
        String phone = appointment.getCustomerProfile().getPhone();

        if (emailEnabled && email != null && !email.isBlank()) {
            DeliveryAttemptResult result = emailService.send(new EmailMessage(email, content.emailSubject(), content.emailBody()));
            logAttempt(appointment, eventType, CommunicationChannel.EMAIL, email, result, reminderOffsetHours);
        } else if (emailEnabled) {
            logAttempt(
                appointment,
                eventType,
                CommunicationChannel.EMAIL,
                "(missing email)",
                DeliveryAttemptResult.skipped("Customer email is missing."),
                reminderOffsetHours
            );
        }

        if (smsEnabled && phone != null && !phone.isBlank()) {
            DeliveryAttemptResult result = smsService.send(new SmsMessage(phone, content.smsBody()));
            logAttempt(appointment, eventType, CommunicationChannel.SMS, phone, result, reminderOffsetHours);
        } else if (smsEnabled) {
            logAttempt(
                appointment,
                eventType,
                CommunicationChannel.SMS,
                "(missing phone)",
                DeliveryAttemptResult.skipped("Customer phone is missing."),
                reminderOffsetHours
            );
        }
    }

    private void logAttempt(
        Appointment appointment,
        CommunicationEventType eventType,
        CommunicationChannel channel,
        String target,
        DeliveryAttemptResult result,
        Integer reminderOffsetHours
    ) {
        CommunicationLog communicationLog = new CommunicationLog();
        communicationLog.setStudio(appointment.getStudio());
        communicationLog.setAppointment(appointment);
        communicationLog.setEventType(eventType);
        communicationLog.setChannel(channel);
        communicationLog.setTarget(target);
        communicationLog.setDeliveryStatus(mapStatus(result));
        communicationLog.setSentAt(result.success() ? Instant.now() : null);
        communicationLog.setErrorMessage(result.errorMessage());
        communicationLog.setReminderOffsetHours(reminderOffsetHours);
        communicationLogRepository.save(communicationLog);

        if (result.success()) {
            LOGGER.debug(
                "Communication sent. appointmentId={} reference={} eventType={} channel={}",
                appointment.getId(),
                appointment.getBookingReference(),
                eventType,
                channel
            );
        } else if (result.skipped()) {
            LOGGER.debug(
                "Communication skipped. appointmentId={} reference={} eventType={} channel={} reason={}",
                appointment.getId(),
                appointment.getBookingReference(),
                eventType,
                channel,
                result.errorMessage()
            );
        } else {
            LOGGER.warn(
                "Communication failed. appointmentId={} reference={} eventType={} channel={} reason={}",
                appointment.getId(),
                appointment.getBookingReference(),
                eventType,
                channel,
                result.errorMessage()
            );
        }
    }

    public boolean hasRecentSuccessfulReminderDelivery(Appointment appointment, Instant threshold) {
        return hasRecentSuccessfulReminderDelivery(appointment, null, threshold);
    }

    public boolean hasRecentSuccessfulReminderDelivery(Appointment appointment, Integer reminderOffsetHours, Instant threshold) {
        return reminderOffsetHours == null
            ? communicationLogRepository.existsByAppointmentIdAndEventTypeAndDeliveryStatusAndSentAtAfter(
                appointment.getId(),
                CommunicationEventType.APPOINTMENT_REMINDER,
                CommunicationDeliveryStatus.SENT,
                threshold
            )
            : communicationLogRepository.existsByAppointmentIdAndEventTypeAndDeliveryStatusAndReminderOffsetHoursAndSentAtAfter(
                appointment.getId(),
                CommunicationEventType.APPOINTMENT_REMINDER,
                CommunicationDeliveryStatus.SENT,
                reminderOffsetHours,
                threshold
            );
    }

    private CommunicationDeliveryStatus mapStatus(DeliveryAttemptResult result) {
        if (result.success()) {
            return CommunicationDeliveryStatus.SENT;
        }

        if (result.skipped()) {
            return CommunicationDeliveryStatus.SKIPPED;
        }

        return CommunicationDeliveryStatus.FAILED;
    }
}
