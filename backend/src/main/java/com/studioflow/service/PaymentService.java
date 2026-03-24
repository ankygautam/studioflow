package com.studioflow.service;

import com.studioflow.dto.payment.PaymentCreateRequest;
import com.studioflow.dto.payment.PaymentResponse;
import com.studioflow.dto.payment.PaymentUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.Payment;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.PaymentRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final CurrentUserService currentUserService;
    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    public PaymentResponse createPayment(PaymentCreateRequest request) {
        validatePaymentMethod(request.paymentStatus(), request.paymentMethod());
        Appointment appointment = findAppointment(request.appointmentId());
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());

        paymentRepository.findByAppointmentId(request.appointmentId()).ifPresent((existingPayment) -> {
            throw new BadRequestException("A payment already exists for this appointment");
        });

        Payment payment = new Payment();
        mapRequest(payment, request, appointment);
        return toResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments(UUID appointmentId, UUID studioId) {
        List<Payment> payments;

        if (appointmentId != null) {
            Appointment appointment = findAppointment(appointmentId);
            currentUserService.ensureStudioAccess(appointment.getStudio().getId());
            payments = paymentRepository.findByAppointmentId(appointmentId)
                .map(List::of)
                .orElseGet(List::of);
        } else {
            UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
            payments = paymentRepository.findByAppointmentStudioId(authorizedStudioId);
        }

        return payments.stream()
            .sorted(Comparator
                .comparing(Payment::getPaidAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Payment::getCreatedAt, Comparator.reverseOrder()))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(UUID id) {
        Payment payment = findPayment(id);
        currentUserService.ensureStudioAccess(payment.getAppointment().getStudio().getId());
        return toResponse(payment);
    }

    public PaymentResponse updatePayment(UUID id, PaymentUpdateRequest request) {
        validatePaymentMethod(request.paymentStatus(), request.paymentMethod());

        Payment payment = findPayment(id);
        currentUserService.ensureStudioAccess(payment.getAppointment().getStudio().getId());
        Appointment appointment = findAppointment(request.appointmentId());
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());

        paymentRepository.findByAppointmentId(request.appointmentId()).ifPresent((existingPayment) -> {
            if (!existingPayment.getId().equals(id)) {
                throw new BadRequestException("A payment already exists for this appointment");
            }
        });

        mapRequest(payment, request, appointment);
        return toResponse(paymentRepository.save(payment));
    }

    public void deletePayment(UUID id) {
        Payment payment = findPayment(id);
        currentUserService.ensureStudioAccess(payment.getAppointment().getStudio().getId());
        paymentRepository.delete(payment);
    }

    private Appointment findAppointment(UUID id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private Payment findPayment(UUID id) {
        return paymentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
    }

    private void mapRequest(Payment payment, PaymentCreateRequest request, Appointment appointment) {
        payment.setAppointment(appointment);
        payment.setAmount(request.amount());
        payment.setDepositAmount(normalizeAmount(request.depositAmount()));
        payment.setPaymentStatus(request.paymentStatus());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setTransactionReference(request.transactionReference());
        payment.setPaidAt(request.paidAt());
    }

    private void mapRequest(Payment payment, PaymentUpdateRequest request, Appointment appointment) {
        payment.setAppointment(appointment);
        payment.setAmount(request.amount());
        payment.setDepositAmount(normalizeAmount(request.depositAmount()));
        payment.setPaymentStatus(request.paymentStatus());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setTransactionReference(request.transactionReference());
        payment.setPaidAt(request.paidAt());
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private void validatePaymentMethod(
        com.studioflow.enums.PaymentStatus paymentStatus,
        com.studioflow.enums.PaymentMethod paymentMethod
    ) {
        if (paymentStatus == com.studioflow.enums.PaymentStatus.PAID && paymentMethod == null) {
            throw new BadRequestException("paymentMethod is required when paymentStatus is PAID");
        }
    }

    private PaymentResponse toResponse(Payment payment) {
        Appointment appointment = payment.getAppointment();

        return new PaymentResponse(
            payment.getId(),
            appointment.getId(),
            appointment.getStudio().getId(),
            payment.getAmount(),
            payment.getDepositAmount(),
            payment.getPaymentStatus(),
            payment.getPaymentMethod(),
            payment.getTransactionReference(),
            payment.getPaidAt(),
            payment.getCreatedAt(),
            payment.getUpdatedAt(),
            appointment.getCustomerProfile().getFullName(),
            appointment.getService().getName(),
            appointment.getAppointmentDate(),
            appointment.getStartTime()
        );
    }
}
