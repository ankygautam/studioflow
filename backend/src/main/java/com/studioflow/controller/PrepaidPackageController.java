package com.studioflow.controller;

import com.studioflow.dto.packages.PrepaidPackageCreateRequest;
import com.studioflow.dto.packages.PrepaidPackageResponse;
import com.studioflow.dto.packages.PrepaidPackageUpdateRequest;
import com.studioflow.service.PrepaidPackageService;
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
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PrepaidPackageController {

    private final PrepaidPackageService prepaidPackageService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PrepaidPackageResponse> createPackage(
        @Valid @RequestBody PrepaidPackageCreateRequest request
    ) {
        PrepaidPackageResponse response = prepaidPackageService.createPackage(request);
        return ResponseEntity.created(URI.create("/api/packages/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<PrepaidPackageResponse>> getAllPackages(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(prepaidPackageService.getAllPackages(studioId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<PrepaidPackageResponse> getPackageById(@PathVariable UUID id) {
        return ResponseEntity.ok(prepaidPackageService.getPackageById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PrepaidPackageResponse> updatePackage(
        @PathVariable UUID id,
        @Valid @RequestBody PrepaidPackageUpdateRequest request
    ) {
        return ResponseEntity.ok(prepaidPackageService.updatePackage(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePackage(@PathVariable UUID id) {
        prepaidPackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
