package com.studioflow.controller;

import com.studioflow.dto.analytics.AnalyticsOverviewResponse;
import com.studioflow.dto.analytics.AppointmentAnalyticsResponse;
import com.studioflow.dto.analytics.RevenueAnalyticsResponse;
import com.studioflow.dto.analytics.ServiceAnalyticsResponse;
import com.studioflow.service.AnalyticsService;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getOverview(studioId, from, to));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueAnalyticsResponse> getRevenue(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getRevenue(studioId, from, to));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentAnalyticsResponse> getAppointments(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getAppointments(studioId, from, to));
    }

    @GetMapping("/services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceAnalyticsResponse> getServices(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(analyticsService.getServices(studioId, from, to));
    }
}
