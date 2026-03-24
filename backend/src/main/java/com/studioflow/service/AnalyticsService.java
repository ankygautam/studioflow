package com.studioflow.service;

import com.studioflow.dto.analytics.AnalyticsOverviewResponse;
import com.studioflow.dto.analytics.AppointmentAnalyticsResponse;
import com.studioflow.dto.analytics.AppointmentStatusMetric;
import com.studioflow.dto.analytics.RevenueAnalyticsResponse;
import com.studioflow.dto.analytics.RevenueTrendPoint;
import com.studioflow.dto.analytics.ServiceAnalyticsItem;
import com.studioflow.dto.analytics.ServiceAnalyticsResponse;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.Payment;
import com.studioflow.entity.Service;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.PaymentStatus;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.PaymentRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final CurrentUserService currentUserService;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ServiceRepository serviceRepository;

    public AnalyticsOverviewResponse getOverview(UUID studioId, LocalDate from, LocalDate to) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<Appointment> appointments = filterAppointments(loadAppointments(authorizedStudioId), from, to);
        List<Payment> payments = filterPayments(loadPayments(authorizedStudioId), from, to);

        return new AnalyticsOverviewResponse(
            appointments.size(),
            countAppointments(appointments, AppointmentStatus.COMPLETED),
            countAppointments(appointments, AppointmentStatus.CANCELLED),
            countAppointments(appointments, AppointmentStatus.NO_SHOW),
            loadClientCount(authorizedStudioId),
            loadActiveServiceCount(authorizedStudioId),
            sumPaymentAmount(payments),
            sumDepositAmount(payments)
        );
    }

    public RevenueAnalyticsResponse getRevenue(UUID studioId, LocalDate from, LocalDate to) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<Payment> payments = filterPayments(loadPayments(authorizedStudioId), from, to);
        List<RevenueTrendPoint> trend = buildRevenueTrend(payments, from, to);

        return new RevenueAnalyticsResponse(
            sumPaymentAmount(payments),
            sumDepositAmount(payments),
            payments.stream().filter(payment -> payment.getPaymentStatus() == PaymentStatus.PAID).count(),
            payments.stream().filter(payment -> payment.getPaymentStatus() != PaymentStatus.PAID).count(),
            trend
        );
    }

    public AppointmentAnalyticsResponse getAppointments(UUID studioId, LocalDate from, LocalDate to) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<Appointment> appointments = filterAppointments(loadAppointments(authorizedStudioId), from, to);
        LocalDate today = LocalDate.now();

        List<AppointmentStatusMetric> statusBreakdown = Arrays.stream(AppointmentStatus.values())
            .map(status -> new AppointmentStatusMetric(status, countAppointments(appointments, status)))
            .toList();

        return new AppointmentAnalyticsResponse(
            appointments.size(),
            countAppointments(appointments, AppointmentStatus.COMPLETED),
            countAppointments(appointments, AppointmentStatus.CANCELLED),
            countAppointments(appointments, AppointmentStatus.NO_SHOW),
            appointments.stream().filter(appointment -> !appointment.getAppointmentDate().isBefore(today)).count(),
            statusBreakdown
        );
    }

    public ServiceAnalyticsResponse getServices(UUID studioId, LocalDate from, LocalDate to) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<Appointment> appointments = filterAppointments(loadAppointments(authorizedStudioId), from, to);
        Map<UUID, List<Appointment>> appointmentsByService = appointments.stream()
            .collect(Collectors.groupingBy(appointment -> appointment.getService().getId()));

        Map<UUID, BigDecimal> revenueByService = filterPayments(loadPayments(authorizedStudioId), from, to).stream()
            .collect(Collectors.groupingBy(
                payment -> payment.getAppointment().getService().getId(),
                Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
            ));

        Map<UUID, Service> serviceLookup = loadServices(authorizedStudioId).stream()
            .collect(Collectors.toMap(Service::getId, Function.identity()));

        List<ServiceAnalyticsItem> topServices = appointmentsByService.entrySet().stream()
            .map(entry -> {
                Service service = serviceLookup.get(entry.getKey());
                BigDecimal revenue = revenueByService.getOrDefault(entry.getKey(), BigDecimal.ZERO);

                return new ServiceAnalyticsItem(
                    entry.getKey(),
                    service != null ? service.getName() : "Archived service",
                    service != null ? service.getCategory() : null,
                    entry.getValue().size(),
                    revenue
                );
            })
            .sorted(Comparator
                .comparing(ServiceAnalyticsItem::totalRevenue, Comparator.reverseOrder())
                .thenComparing(ServiceAnalyticsItem::bookingCount, Comparator.reverseOrder()))
            .limit(4)
            .toList();

        return new ServiceAnalyticsResponse(topServices);
    }

    private List<Appointment> loadAppointments(UUID studioId) {
        return studioId != null ? appointmentRepository.findByStudioId(studioId) : appointmentRepository.findAll();
    }

    private List<Payment> loadPayments(UUID studioId) {
        return studioId != null ? paymentRepository.findByAppointmentStudioId(studioId) : paymentRepository.findAll();
    }

    private List<Service> loadServices(UUID studioId) {
        return studioId != null ? serviceRepository.findByStudioId(studioId) : serviceRepository.findAll();
    }

    private long loadClientCount(UUID studioId) {
        return studioId != null
            ? customerProfileRepository.countByStudioIdAndIsActiveTrue(studioId)
            : customerProfileRepository.findAll().stream().filter(customer -> Boolean.TRUE.equals(customer.getIsActive())).count();
    }

    private long loadActiveServiceCount(UUID studioId) {
        return studioId != null
            ? serviceRepository.countByStudioIdAndIsActiveTrue(studioId)
            : serviceRepository.findAll().stream().filter(service -> Boolean.TRUE.equals(service.getIsActive())).count();
    }

    private List<Appointment> filterAppointments(List<Appointment> appointments, LocalDate from, LocalDate to) {
        return appointments.stream()
            .filter(appointment -> from == null || !appointment.getAppointmentDate().isBefore(from))
            .filter(appointment -> to == null || !appointment.getAppointmentDate().isAfter(to))
            .toList();
    }

    private List<Payment> filterPayments(List<Payment> payments, LocalDate from, LocalDate to) {
        return payments.stream()
            .filter(payment -> {
                LocalDate date = extractPaymentDate(payment);
                return from == null || date == null || !date.isBefore(from);
            })
            .filter(payment -> {
                LocalDate date = extractPaymentDate(payment);
                return to == null || date == null || !date.isAfter(to);
            })
            .toList();
    }

    private LocalDate extractPaymentDate(Payment payment) {
        Instant paidAt = payment.getPaidAt();
        if (paidAt != null) {
            return paidAt.atZone(ZoneOffset.UTC).toLocalDate();
        }

        return payment.getCreatedAt() != null ? payment.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate() : null;
    }

    private long countAppointments(List<Appointment> appointments, AppointmentStatus status) {
        return appointments.stream().filter(appointment -> appointment.getStatus() == status).count();
    }

    private BigDecimal sumPaymentAmount(List<Payment> payments) {
        return payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumDepositAmount(List<Payment> payments) {
        return payments.stream()
            .map(payment -> payment.getDepositAmount() == null ? BigDecimal.ZERO : payment.getDepositAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<RevenueTrendPoint> buildRevenueTrend(List<Payment> payments, LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : end.minusDays(6);

        Map<LocalDate, BigDecimal> revenueByDate = payments.stream()
            .filter(payment -> extractPaymentDate(payment) != null)
            .collect(Collectors.groupingBy(
                this::extractPaymentDate,
                Collectors.mapping(Payment::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
            ));

        Map<LocalDate, BigDecimal> depositsByDate = payments.stream()
            .filter(payment -> extractPaymentDate(payment) != null)
            .collect(Collectors.groupingBy(
                this::extractPaymentDate,
                Collectors.mapping(
                    payment -> payment.getDepositAmount() == null ? BigDecimal.ZERO : payment.getDepositAmount(),
                    Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
                )
            ));

        return start.datesUntil(end.plusDays(1))
            .map(date -> new RevenueTrendPoint(
                date,
                revenueByDate.getOrDefault(date, BigDecimal.ZERO),
                depositsByDate.getOrDefault(date, BigDecimal.ZERO)
            ))
            .toList();
    }
}
