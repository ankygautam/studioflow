package com.studioflow.controller;

import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.PaymentStatus;
import com.studioflow.enums.StaffStatus;
import com.studioflow.service.ReportExportService;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports/exports")
@RequiredArgsConstructor
public class ReportExportController {

    private final ReportExportService reportExportService;

    @GetMapping(value = "/appointments.csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<byte[]> exportAppointmentsCsv(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) UUID locationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) AppointmentStatus status,
        @RequestParam(required = false) UUID staffId,
        @RequestParam(required = false) UUID serviceId
    ) {
        return csvResponse(
            "appointments",
            reportExportService.exportAppointmentsCsv(studioId, locationId, fromDate, toDate, status, staffId, serviceId)
        );
    }

    @GetMapping(value = "/payments.csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<byte[]> exportPaymentsCsv(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) UUID locationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) PaymentStatus status,
        @RequestParam(required = false) UUID staffId,
        @RequestParam(required = false) UUID serviceId
    ) {
        return csvResponse(
            "payments",
            reportExportService.exportPaymentsCsv(studioId, locationId, fromDate, toDate, status, staffId, serviceId)
        );
    }

    @GetMapping(value = "/clients.csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<byte[]> exportClientsCsv(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) Boolean active
    ) {
        return csvResponse(
            "clients",
            reportExportService.exportClientsCsv(studioId, fromDate, toDate, active)
        );
    }

    @GetMapping(value = "/staff.csv", produces = "text/csv")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<byte[]> exportStaffCsv(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) UUID locationId,
        @RequestParam(required = false) StaffStatus status
    ) {
        return csvResponse(
            "staff",
            reportExportService.exportStaffCsv(studioId, locationId, status)
        );
    }

    private ResponseEntity<byte[]> csvResponse(String prefix, String csv) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + prefix + "-" + LocalDate.now() + ".csv\"")
            .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
            .body(csv.getBytes(StandardCharsets.UTF_8));
    }
}
