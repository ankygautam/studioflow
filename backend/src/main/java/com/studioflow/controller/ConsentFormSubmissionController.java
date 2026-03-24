package com.studioflow.controller;

import com.studioflow.dto.consent.ConsentFormSubmissionCreateRequest;
import com.studioflow.dto.consent.ConsentFormSubmissionResponse;
import com.studioflow.dto.consent.ConsentFormSubmissionUpdateRequest;
import com.studioflow.service.ConsentFormSubmissionService;
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
@RequestMapping("/api/forms/submissions")
@RequiredArgsConstructor
public class ConsentFormSubmissionController {

    private final ConsentFormSubmissionService consentFormSubmissionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ConsentFormSubmissionResponse> createSubmission(
        @Valid @RequestBody ConsentFormSubmissionCreateRequest request
    ) {
        ConsentFormSubmissionResponse response = consentFormSubmissionService.createSubmission(request);
        return ResponseEntity.created(URI.create("/api/forms/submissions/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<List<ConsentFormSubmissionResponse>> getAllSubmissions(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) UUID customerProfileId,
        @RequestParam(required = false) UUID appointmentId
    ) {
        return ResponseEntity.ok(
            consentFormSubmissionService.getAllSubmissions(studioId, customerProfileId, appointmentId)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ConsentFormSubmissionResponse> getSubmissionById(@PathVariable UUID id) {
        return ResponseEntity.ok(consentFormSubmissionService.getSubmissionById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ConsentFormSubmissionResponse> updateSubmission(
        @PathVariable UUID id,
        @Valid @RequestBody ConsentFormSubmissionUpdateRequest request
    ) {
        return ResponseEntity.ok(consentFormSubmissionService.updateSubmission(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Void> deleteSubmission(@PathVariable UUID id) {
        consentFormSubmissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }
}
