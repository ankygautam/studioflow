package com.studioflow.controller;

import com.studioflow.dto.waitlist.WaitlistEntryCreateRequest;
import com.studioflow.dto.waitlist.WaitlistEntryResponse;
import com.studioflow.dto.waitlist.WaitlistEntryUpdateRequest;
import com.studioflow.service.WaitlistService;
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
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<WaitlistEntryResponse> createEntry(
        @Valid @RequestBody WaitlistEntryCreateRequest request
    ) {
        WaitlistEntryResponse response = waitlistService.createEntry(request);
        return ResponseEntity.created(URI.create("/api/waitlist/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<WaitlistEntryResponse>> getEntries(
        @RequestParam(required = false) UUID studioId,
        @RequestParam(required = false) UUID locationId
    ) {
        return ResponseEntity.ok(waitlistService.getEntries(studioId, locationId));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<WaitlistEntryResponse>> getCancellationMatchSuggestions(
        @RequestParam UUID appointmentId
    ) {
        return ResponseEntity.ok(waitlistService.getCancellationMatchSuggestions(appointmentId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<WaitlistEntryResponse> getEntryById(@PathVariable UUID id) {
        return ResponseEntity.ok(waitlistService.getEntryById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<WaitlistEntryResponse> updateEntry(
        @PathVariable UUID id,
        @Valid @RequestBody WaitlistEntryUpdateRequest request
    ) {
        return ResponseEntity.ok(waitlistService.updateEntry(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Void> deleteEntry(@PathVariable UUID id) {
        waitlistService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
