package com.studioflow.dto.payment;

import com.studioflow.enums.PaymentMethod;
import com.studioflow.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentCreateRequest(
    @NotNull UUID appointmentId,
    @NotNull @DecimalMin(value = "0.00") BigDecimal amount,
    @DecimalMin(value = "0.00") BigDecimal depositAmount,
    @NotNull PaymentStatus paymentStatus,
    PaymentMethod paymentMethod,
    @Size(max = 160) String transactionReference,
    Instant paidAt
) {
}
