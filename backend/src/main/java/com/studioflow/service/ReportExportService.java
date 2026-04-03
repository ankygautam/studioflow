package com.studioflow.service;

import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.client.ClientResponse;
import com.studioflow.dto.payment.PaymentResponse;
import com.studioflow.dto.staff.StaffResponse;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.PaymentStatus;
import com.studioflow.enums.StaffStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportExportService {

    private final AppointmentService appointmentService;
    private final PaymentService paymentService;
    private final ClientService clientService;
    private final StaffService staffService;

    public String exportAppointmentsCsv(
        UUID studioId,
        UUID locationId,
        LocalDate fromDate,
        LocalDate toDate,
        AppointmentStatus status,
        UUID staffId,
        UUID serviceId
    ) {
        List<AppointmentResponse> appointments = appointmentService.getAllAppointments(studioId, locationId).stream()
            .filter((appointment) -> matchesDateRange(appointment.appointmentDate(), fromDate, toDate))
            .filter((appointment) -> status == null || appointment.status() == status)
            .filter((appointment) -> staffId == null || appointment.staffProfileId().equals(staffId))
            .filter((appointment) -> serviceId == null || appointment.serviceId().equals(serviceId))
            .toList();

        return buildCsv(
            List.of("Client", "Location", "Date", "Start Time", "End Time", "Service", "Staff", "Status", "Source", "Notes", "Created At", "Updated At"),
            appointments.stream()
                .map((appointment) -> row(
                    appointment.customerName(),
                    appointment.locationName(),
                    appointment.appointmentDate(),
                    appointment.startTime(),
                    appointment.endTime(),
                    appointment.serviceName(),
                    appointment.staffName(),
                    appointment.status(),
                    appointment.source(),
                    appointment.notes(),
                    appointment.createdAt(),
                    appointment.updatedAt()
                ))
                .toList()
        );
    }

    public String exportPaymentsCsv(
        UUID studioId,
        UUID locationId,
        LocalDate fromDate,
        LocalDate toDate,
        PaymentStatus status,
        UUID staffId,
        UUID serviceId
    ) {
        List<AppointmentResponse> scopedAppointments = appointmentService.getAllAppointments(studioId, locationId).stream()
            .filter((appointment) -> matchesDateRange(appointment.appointmentDate(), fromDate, toDate))
            .filter((appointment) -> staffId == null || appointment.staffProfileId().equals(staffId))
            .filter((appointment) -> serviceId == null || appointment.serviceId().equals(serviceId))
            .toList();

        Map<UUID, AppointmentResponse> appointmentsById = new LinkedHashMap<>();
        for (AppointmentResponse appointment : scopedAppointments) {
            appointmentsById.put(appointment.id(), appointment);
        }

        List<PaymentResponse> payments = paymentService.getAllPayments(null, studioId, locationId).stream()
            .filter((payment) -> appointmentsById.containsKey(payment.appointmentId()))
            .filter((payment) -> status == null || payment.paymentStatus() == status)
            .toList();

        return buildCsv(
            List.of(
                "Client",
                "Location",
                "Appointment Date",
                "Appointment Time",
                "Service",
                "Staff",
                "Amount",
                "Deposit",
                "Payment Status",
                "Payment Method",
                "Paid At",
                "Transaction Reference",
                "Created At",
                "Updated At"
            ),
            payments.stream()
                .map((payment) -> {
                    AppointmentResponse appointment = appointmentsById.get(payment.appointmentId());
                    return row(
                        payment.customerName(),
                        payment.locationName(),
                        payment.appointmentDate(),
                        payment.appointmentStartTime(),
                        payment.serviceName(),
                        appointment != null ? appointment.staffName() : "",
                        payment.amount(),
                        payment.depositAmount(),
                        payment.paymentStatus(),
                        payment.paymentMethod(),
                        payment.paidAt(),
                        payment.transactionReference(),
                        payment.createdAt(),
                        payment.updatedAt()
                    );
                })
                .toList()
        );
    }

    public String exportClientsCsv(
        UUID studioId,
        LocalDate fromDate,
        LocalDate toDate,
        Boolean active
    ) {
        List<ClientResponse> clients = clientService.getAllClients(studioId).stream()
            .filter((client) -> matchesInstantDateRange(client.createdAt(), fromDate, toDate))
            .filter((client) -> active == null || client.isActive().equals(active))
            .toList();

        return buildCsv(
            List.of("Full Name", "Email", "Phone", "Date Of Birth", "Active", "Created At", "Updated At", "Notes"),
            clients.stream()
                .map((client) -> row(
                    client.fullName(),
                    client.email(),
                    client.phone(),
                    client.dateOfBirth(),
                    client.isActive(),
                    client.createdAt(),
                    client.updatedAt(),
                    client.notes()
                ))
                .toList()
        );
    }

    public String exportStaffCsv(
        UUID studioId,
        UUID locationId,
        StaffStatus status
    ) {
        List<StaffResponse> staffMembers = staffService.getAllStaff(studioId, locationId).stream()
            .filter((staffMember) -> status == null || staffMember.status() == status)
            .toList();

        return buildCsv(
            List.of(
                "Display Name",
                "Primary Location",
                "Job Title",
                "Phone",
                "Status",
                "Commission Rate",
                "User Email",
                "User Role",
                "Created At",
                "Updated At"
            ),
            staffMembers.stream()
                .map((staffMember) -> row(
                    staffMember.displayName(),
                    staffMember.primaryLocationName(),
                    staffMember.jobTitle(),
                    staffMember.phone(),
                    staffMember.status(),
                    staffMember.commissionRate(),
                    staffMember.userEmail(),
                    staffMember.userRole(),
                    staffMember.createdAt(),
                    staffMember.updatedAt()
                ))
                .toList()
        );
    }

    private boolean matchesDateRange(LocalDate value, LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && value.isBefore(fromDate)) {
            return false;
        }

        if (toDate != null && value.isAfter(toDate)) {
            return false;
        }

        return true;
    }

    private boolean matchesInstantDateRange(Instant value, LocalDate fromDate, LocalDate toDate) {
        LocalDate date = value.atZone(ZoneOffset.UTC).toLocalDate();
        return matchesDateRange(date, fromDate, toDate);
    }

    private List<Object> row(Object... values) {
        return java.util.Arrays.asList(values);
    }

    private String buildCsv(List<String> columns, List<List<Object>> rows) {
        StringBuilder builder = new StringBuilder();
        builder.append(String.join(",", columns.stream().map(this::escapeCsv).toList()));
        builder.append('\n');

        for (List<Object> row : rows) {
            builder.append(String.join(",", row.stream().map(this::stringify).map(this::escapeCsv).toList()));
            builder.append('\n');
        }

        return builder.toString();
    }

    private String stringify(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String escapeCsv(String value) {
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }

        return value;
    }
}
