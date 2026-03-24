package com.studioflow.dto.communication;

public record SmsMessage(
    String to,
    String body
) {
}
