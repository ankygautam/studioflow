package com.studioflow.dto.communication;

public record AppointmentCommunicationContent(
    String emailSubject,
    String emailBody,
    String smsBody
) {
}
