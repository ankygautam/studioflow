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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationDeliveryService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final AppointmentCommunicationFactory appointmentCommunicationFactory;
    private final CommunicationLogRepository communicationLogRepository;

    public void sendBookingConfirmation(Appointment appointment) {
        sendAppointmentCommunication(appointment, CommunicationEventType.BOOKING_CONFIRMED);
    }

    public void sendAppointmentReminder(Appointment appointment) {
        if (hasRecentSuccessfulReminderDelivery(appointment, Instant.now().minusSeconds(60L * 60L * 12L))) {
            return;
        }

        sendAppointmentCommunication(appointment, CommunicationEventType.APPOINTMENT_REMINDER);
    }

    public void sendBookingRescheduledConfirmation(Appointment appointment) {
        sendAppointmentCommunication(appointment, CommunicationEventType.BOOKING_RESCHEDULED);
    }

    public void sendBookingCancelledConfirmation(Appointment appointment) {
        sendAppointmentCommunication(appointment, CommunicationEventType.BOOKING_CANCELLED);
    }

    private void sendAppointmentCommunication(Appointment appointment, CommunicationEventType eventType) {
        AppointmentCommunicationContent content = appointmentCommunicationFactory.build(appointment, eventType);
        String email = appointment.getCustomerProfile().getEmail();
        String phone = appointment.getCustomerProfile().getPhone();

        if (email != null && !email.isBlank()) {
            DeliveryAttemptResult result = emailService.send(new EmailMessage(email, content.emailSubject(), content.emailBody()));
            logAttempt(appointment, eventType, CommunicationChannel.EMAIL, email, result);
        } else {
            logAttempt(appointment, eventType, CommunicationChannel.EMAIL, "(missing email)", DeliveryAttemptResult.skipped("Customer email is missing."));
        }

        if (phone != null && !phone.isBlank()) {
            DeliveryAttemptResult result = smsService.send(new SmsMessage(phone, content.smsBody()));
            logAttempt(appointment, eventType, CommunicationChannel.SMS, phone, result);
        } else {
            logAttempt(appointment, eventType, CommunicationChannel.SMS, "(missing phone)", DeliveryAttemptResult.skipped("Customer phone is missing."));
        }
    }

    private void logAttempt(
        Appointment appointment,
        CommunicationEventType eventType,
        CommunicationChannel channel,
        String target,
        DeliveryAttemptResult result
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
        communicationLogRepository.save(communicationLog);
    }

    public boolean hasRecentSuccessfulReminderDelivery(Appointment appointment, Instant threshold) {
        return communicationLogRepository.existsByAppointmentIdAndEventTypeAndDeliveryStatusAndSentAtAfter(
            appointment.getId(),
            CommunicationEventType.APPOINTMENT_REMINDER,
            CommunicationDeliveryStatus.SENT,
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
