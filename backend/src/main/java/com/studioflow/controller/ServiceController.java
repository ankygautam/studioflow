package com.studioflow.controller;

import com.studioflow.dto.service.ServiceCreateRequest;
import com.studioflow.dto.service.ServiceResponse;
import com.studioflow.dto.service.ServiceUpdateRequest;
import com.studioflow.service.ServiceService;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceResponse> createService(
        @Valid @RequestBody ServiceCreateRequest request
    ) {
        ServiceResponse response = serviceService.createService(request);
        return ResponseEntity.created(URI.create("/api/services/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<ServiceResponse>> getAllServices(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(serviceService.getAllServices(studioId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceResponse> updateService(
        @PathVariable UUID id,
        @Valid @RequestBody ServiceUpdateRequest request
    ) {
        return ResponseEntity.ok(serviceService.updateService(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
