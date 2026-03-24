package com.studioflow.dto.payment;

import com.studioflow.enums.PaymentMethod;
import com.studioflow.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    UUID appointmentId,
    UUID studioId,
    BigDecimal amount,
    BigDecimal depositAmount,
    PaymentStatus paymentStatus,
    PaymentMethod paymentMethod,
    String transactionReference,
    Instant paidAt,
    Instant createdAt,
    Instant updatedAt,
    String customerName,
    String serviceName,
    LocalDate appointmentDate,
    LocalTime appointmentStartTime
) {
}
