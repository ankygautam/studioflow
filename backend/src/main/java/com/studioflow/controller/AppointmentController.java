package com.studioflow.controller;

import com.studioflow.dto.appointment.AppointmentCreateRequest;
import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.appointment.AppointmentUpdateRequest;
import com.studioflow.service.AppointmentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<AppointmentResponse> createAppointment(
        @Valid @RequestBody AppointmentCreateRequest request
    ) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        return ResponseEntity.created(URI.create("/api/appointments/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(appointmentService.getAllAppointments(studioId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<AppointmentResponse> updateAppointment(
        @PathVariable UUID id,
        @Valid @RequestBody AppointmentUpdateRequest request
    ) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable UUID id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
