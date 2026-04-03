package com.studioflow.controller;

import com.studioflow.dto.packages.ClientPackageAssignmentCreateRequest;
import com.studioflow.dto.packages.ClientPackageAssignmentResponse;
import com.studioflow.service.ClientPackageAssignmentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/client-packages")
@RequiredArgsConstructor
public class ClientPackageAssignmentController {

    private final ClientPackageAssignmentService clientPackageAssignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ClientPackageAssignmentResponse> assignPackage(
        @Valid @RequestBody ClientPackageAssignmentCreateRequest request
    ) {
        ClientPackageAssignmentResponse response = clientPackageAssignmentService.assignPackage(request);
        return ResponseEntity.created(URI.create("/api/client-packages/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<ClientPackageAssignmentResponse>> getAssignments(
        @RequestParam UUID customerProfileId
    ) {
        return ResponseEntity.ok(clientPackageAssignmentService.getAssignments(customerProfileId));
    }
}
