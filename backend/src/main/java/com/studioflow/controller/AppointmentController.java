package com.studioflow.controller;

import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.appointment.CreateAppointmentRequest;
import com.studioflow.dto.appointment.UpdateAppointmentRequest;
import com.studioflow.service.AppointmentManagementService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    private final AppointmentManagementService appointmentManagementService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(
        @Valid @RequestBody CreateAppointmentRequest request
    ) {
        AppointmentResponse response = appointmentManagementService.create(request);
        return ResponseEntity.created(URI.create("/api/appointments/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAll(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(appointmentManagementService.getAll(studioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentManagementService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateAppointmentRequest request
    ) {
        return ResponseEntity.ok(appointmentManagementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        appointmentManagementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
