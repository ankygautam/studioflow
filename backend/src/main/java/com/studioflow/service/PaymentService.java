package com.studioflow.service;

import com.studioflow.dto.payment.PaymentCreateRequest;
import com.studioflow.dto.payment.PaymentResponse;
import com.studioflow.dto.payment.PaymentUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.Payment;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.PaymentRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public PaymentResponse createPayment(PaymentCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        validatePaymentMethod(request.paymentStatus(), request.paymentMethod());
        Appointment appointment = findAppointment(request.appointmentId());
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());

        paymentRepository.findByAppointmentId(request.appointmentId()).ifPresent((existingPayment) -> {
            throw new BadRequestException("A payment already exists for this appointment");
        });

        Payment payment = new Payment();
        mapRequest(payment, request, appointment);
        Payment savedPayment = paymentRepository.save(payment);
        notificationService.notifyPaymentSaved(savedPayment);
        auditLogService.log(
            AuditEntityType.PAYMENT,
            savedPayment.getId(),
            AuditActionType.CREATED,
            savedPayment.getAppointment().getStudio().getId(),
            savedPayment.getAppointment().getLocation().getId(),
            "Payment recorded",
            "A payment was recorded for " + savedPayment.getAppointment().getCustomerProfile().getFullName() + "."
        );
        return toResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments(UUID appointmentId, UUID studioId, UUID locationId) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        List<Payment> payments;

        if (appointmentId != null) {
            Appointment appointment = findAppointment(appointmentId);
            currentUserService.ensureStudioAccess(appointment.getStudio().getId());
            if (locationId != null) {
                currentUserService.ensureLocationAccess(locationId);
                if (!appointment.getLocation().getId().equals(locationId)) {
                    throw new BadRequestException("The selected appointment does not belong to that location");
                }
            }
            payments = paymentRepository.findByAppointmentId(appointmentId)
                .map(List::of)
                .orElseGet(List::of);
        } else {
            UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
            if (locationId != null) {
                UUID authorizedLocationId = currentUserService.requireLocationAccess(locationId);
                payments = paymentRepository.findByAppointmentStudioIdAndAppointmentLocationId(
                    authorizedStudioId,
                    authorizedLocationId
                );
            } else {
                payments = paymentRepository.findByAppointmentStudioId(authorizedStudioId);
            }
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
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        Payment payment = findPayment(id);
        currentUserService.ensureStudioAccess(payment.getAppointment().getStudio().getId());
        return toResponse(payment);
    }

    public PaymentResponse updatePayment(UUID id, PaymentUpdateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        validatePaymentMethod(request.paymentStatus(), request.paymentMethod());

        Payment payment = findPayment(id);
        currentUserService.ensureStudioAccess(payment.getAppointment().getStudio().getId());
        com.studioflow.enums.PaymentStatus previousStatus = payment.getPaymentStatus();
        Appointment appointment = findAppointment(request.appointmentId());
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());

        paymentRepository.findByAppointmentId(request.appointmentId()).ifPresent((existingPayment) -> {
            if (!existingPayment.getId().equals(id)) {
                throw new BadRequestException("A payment already exists for this appointment");
            }
        });

        mapRequest(payment, request, appointment);
        Payment savedPayment = paymentRepository.save(payment);
        notificationService.notifyPaymentSaved(savedPayment);
        auditLogService.log(
            AuditEntityType.PAYMENT,
            savedPayment.getId(),
            previousStatus != savedPayment.getPaymentStatus() ? AuditActionType.STATUS_CHANGED : AuditActionType.UPDATED,
            savedPayment.getAppointment().getStudio().getId(),
            savedPayment.getAppointment().getLocation().getId(),
            previousStatus != savedPayment.getPaymentStatus() ? "Payment status changed" : "Payment updated",
            previousStatus != savedPayment.getPaymentStatus()
                ? "Payment status changed to " + savedPayment.getPaymentStatus() + "."
                : "Payment details were updated.",
            buildPaymentMetadata(savedPayment, previousStatus)
        );
        return toResponse(savedPayment);
    }

    public void deletePayment(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        Payment payment = findPayment(id);
        currentUserService.ensureStudioAccess(payment.getAppointment().getStudio().getId());
        paymentRepository.delete(payment);
        auditLogService.log(
            AuditEntityType.PAYMENT,
            payment.getId(),
            AuditActionType.DELETED,
            payment.getAppointment().getStudio().getId(),
            payment.getAppointment().getLocation().getId(),
            "Payment deleted",
            "A payment record for " + payment.getAppointment().getCustomerProfile().getFullName() + " was deleted."
        );
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

    private Map<String, Object> buildPaymentMetadata(
        Payment payment,
        com.studioflow.enums.PaymentStatus previousStatus
    ) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("amount", payment.getAmount());
        metadata.put("depositAmount", payment.getDepositAmount());
        metadata.put("previousStatus", previousStatus.name());
        metadata.put("newStatus", payment.getPaymentStatus().name());
        metadata.put("paymentMethod", payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null);
        return metadata;
    }

    private PaymentResponse toResponse(Payment payment) {
        Appointment appointment = payment.getAppointment();

        return new PaymentResponse(
            payment.getId(),
            appointment.getId(),
            appointment.getStudio().getId(),
            appointment.getLocation().getId(),
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
            appointment.getLocation().getName(),
            appointment.getAppointmentDate(),
            appointment.getStartTime()
        );
    }
}
