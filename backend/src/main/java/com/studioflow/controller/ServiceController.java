package com.studioflow.controller;

import com.studioflow.dto.service.CreateServiceRequest;
import com.studioflow.dto.service.ServiceResponse;
import com.studioflow.dto.service.UpdateServiceRequest;
import com.studioflow.service.ServiceCatalogService;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    @PostMapping
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody CreateServiceRequest request) {
        ServiceResponse response = serviceCatalogService.create(request);
        return ResponseEntity.created(URI.create("/api/services/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAll(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(serviceCatalogService.getAll(studioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceCatalogService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateServiceRequest request
    ) {
        return ResponseEntity.ok(serviceCatalogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        serviceCatalogService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
