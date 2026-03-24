package com.studioflow.dto.communication;

public record EmailMessage(
    String to,
    String subject,
    String body
) {
}
