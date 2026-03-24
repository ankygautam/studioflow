package com.studioflow.controller;

import com.studioflow.dto.consent.ConsentFormTemplateCreateRequest;
import com.studioflow.dto.consent.ConsentFormTemplateResponse;
import com.studioflow.dto.consent.ConsentFormTemplateUpdateRequest;
import com.studioflow.service.ConsentFormTemplateService;
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
@RequestMapping("/api/forms/templates")
@RequiredArgsConstructor
public class ConsentFormTemplateController {

    private final ConsentFormTemplateService consentFormTemplateService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ConsentFormTemplateResponse> createTemplate(
        @Valid @RequestBody ConsentFormTemplateCreateRequest request
    ) {
        ConsentFormTemplateResponse response = consentFormTemplateService.createTemplate(request);
        return ResponseEntity.created(URI.create("/api/forms/templates/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<List<ConsentFormTemplateResponse>> getAllTemplates(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(consentFormTemplateService.getAllTemplates(studioId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ConsentFormTemplateResponse> getTemplateById(@PathVariable UUID id) {
        return ResponseEntity.ok(consentFormTemplateService.getTemplateById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ConsentFormTemplateResponse> updateTemplate(
        @PathVariable UUID id,
        @Valid @RequestBody ConsentFormTemplateUpdateRequest request
    ) {
        return ResponseEntity.ok(consentFormTemplateService.updateTemplate(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        consentFormTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
