package com.studioflow.service.communication;

import com.studioflow.config.communication.CommunicationProperties;
import com.studioflow.dto.communication.AppointmentCommunicationContent;
import com.studioflow.entity.Appointment;
import com.studioflow.enums.CommunicationEventType;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentCommunicationFactory {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMM d", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    private final CommunicationProperties communicationProperties;

    public AppointmentCommunicationContent build(Appointment appointment, CommunicationEventType eventType) {
        String studioName = appointment.getStudio().getName();
        String customerName = appointment.getCustomerProfile().getFullName();
        String serviceName = appointment.getService().getName();
        String staffName = appointment.getStaffProfile().getDisplayName();
        String appointmentDate = appointment.getAppointmentDate().format(DATE_FORMATTER);
        String startTime = appointment.getStartTime().format(TIME_FORMATTER);
        String bookingReference = appointment.getBookingReference();
        String manageUrl = buildManageUrl(appointment);

        String emailSubject = switch (eventType) {
            case BOOKING_CONFIRMED -> "Booking confirmed: " + serviceName + " on " + appointmentDate;
            case APPOINTMENT_REMINDER -> "Upcoming appointment reminder: " + serviceName;
            case BOOKING_RESCHEDULED -> "Booking updated: " + serviceName + " on " + appointmentDate;
            case BOOKING_CANCELLED -> "Booking cancelled: " + serviceName;
        };

        String smsBody = switch (eventType) {
            case BOOKING_CONFIRMED -> studioName + ": Your booking is confirmed for " + serviceName + " on "
                + appointmentDate + " at " + startTime + ". Ref: " + bookingReference + appendManageHint(manageUrl);
            case APPOINTMENT_REMINDER -> studioName + ": Reminder for " + serviceName + " on "
                + appointmentDate + " at " + startTime + ". Ref: " + bookingReference + appendManageHint(manageUrl);
            case BOOKING_RESCHEDULED -> studioName + ": Your booking was rescheduled to "
                + appointmentDate + " at " + startTime + ". Ref: " + bookingReference + appendManageHint(manageUrl);
            case BOOKING_CANCELLED -> studioName + ": Your booking for " + serviceName + " has been cancelled. Ref: "
                + bookingReference + appendManageHint(manageUrl);
        };

        StringBuilder emailBody = new StringBuilder()
            .append("Hi ").append(customerName).append(",\n\n");

        switch (eventType) {
            case BOOKING_CONFIRMED -> emailBody.append("Your booking has been confirmed.\n\n");
            case APPOINTMENT_REMINDER -> emailBody.append("This is a reminder about your upcoming appointment.\n\n");
            case BOOKING_RESCHEDULED -> emailBody.append("Your booking details have been updated.\n\n");
            case BOOKING_CANCELLED -> emailBody.append("Your booking has been cancelled.\n\n");
        }

        emailBody
            .append("Studio: ").append(studioName).append("\n")
            .append("Service: ").append(serviceName).append("\n")
            .append("Staff: ").append(staffName).append("\n")
            .append("Date: ").append(appointmentDate).append("\n")
            .append("Time: ").append(startTime).append("\n")
            .append("Booking reference: ").append(bookingReference).append("\n");

        appendDepositLine(emailBody, appointment);

        if (manageUrl != null) {
            emailBody
                .append("\nManage booking: ").append(manageUrl).append("\n")
                .append("Use your booking reference plus your email or phone to manage it.\n");
        }

        if (appointment.getStudio().getPhone() != null && !appointment.getStudio().getPhone().isBlank()) {
            emailBody.append("Need help? Contact the studio at ").append(appointment.getStudio().getPhone()).append(".\n");
        } else if (appointment.getStudio().getEmail() != null && !appointment.getStudio().getEmail().isBlank()) {
            emailBody.append("Need help? Contact the studio at ").append(appointment.getStudio().getEmail()).append(".\n");
        }

        emailBody.append("\nThank you,\n").append(studioName);

        return new AppointmentCommunicationContent(emailSubject, emailBody.toString(), smsBody);
    }

    private void appendDepositLine(StringBuilder emailBody, Appointment appointment) {
        if (Boolean.TRUE.equals(appointment.getService().getDepositRequired())) {
            BigDecimal depositAmount = appointment.getService().getDepositAmount();
            if (depositAmount != null) {
                emailBody.append("Deposit: $").append(depositAmount).append("\n");
            }
        }
    }

    private String buildManageUrl(Appointment appointment) {
        if (communicationProperties.getPublicBaseUrl() == null || communicationProperties.getPublicBaseUrl().isBlank()) {
            return null;
        }

        String baseUrl = communicationProperties.getPublicBaseUrl().endsWith("/")
            ? communicationProperties.getPublicBaseUrl().substring(0, communicationProperties.getPublicBaseUrl().length() - 1)
            : communicationProperties.getPublicBaseUrl();

        return baseUrl + "/book/" + toStudioSlug(appointment.getStudio().getName()) + "/manage";
    }

    private String appendManageHint(String manageUrl) {
        return manageUrl == null ? "" : " Manage: " + manageUrl;
    }

    private String toStudioSlug(String studioName) {
        String slug = studioName.toLowerCase(Locale.ENGLISH)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "studioflow" : slug;
    }
}
