package com.studioflow.repository;

import com.studioflow.entity.Payment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByAppointmentId(UUID appointmentId);

    List<Payment> findByAppointmentStudioId(UUID studioId);

    List<Payment> findByPaymentStatus(com.studioflow.enums.PaymentStatus paymentStatus);
}
