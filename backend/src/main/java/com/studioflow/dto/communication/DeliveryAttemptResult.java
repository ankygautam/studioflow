package com.studioflow.dto.communication;

public record DeliveryAttemptResult(
    boolean success,
    boolean skipped,
    String errorMessage
) {

    public static DeliveryAttemptResult sent() {
        return new DeliveryAttemptResult(true, false, null);
    }

    public static DeliveryAttemptResult failed(String errorMessage) {
        return new DeliveryAttemptResult(false, false, errorMessage);
    }

    public static DeliveryAttemptResult skipped(String errorMessage) {
        return new DeliveryAttemptResult(false, true, errorMessage);
    }
}
