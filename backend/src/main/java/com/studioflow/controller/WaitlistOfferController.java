package com.studioflow.controller;

import com.studioflow.dto.waitlist.WaitlistSlotOfferCreateRequest;
import com.studioflow.dto.waitlist.WaitlistSlotOfferResponse;
import com.studioflow.dto.waitlist.WaitlistSlotOfferStatusUpdateRequest;
import com.studioflow.service.WaitlistOfferService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/waitlist/offers")
@RequiredArgsConstructor
public class WaitlistOfferController {

    private final WaitlistOfferService waitlistOfferService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<WaitlistSlotOfferResponse> createOffer(
        @Valid @RequestBody WaitlistSlotOfferCreateRequest request
    ) {
        WaitlistSlotOfferResponse response = waitlistOfferService.createOffer(request);
        return ResponseEntity.created(URI.create("/api/waitlist/offers/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<WaitlistSlotOfferResponse>> getOffers(
        @RequestParam UUID cancelledAppointmentId
    ) {
        return ResponseEntity.ok(waitlistOfferService.getOffers(cancelledAppointmentId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<WaitlistSlotOfferResponse> updateOfferStatus(
        @PathVariable UUID id,
        @Valid @RequestBody WaitlistSlotOfferStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(waitlistOfferService.updateOfferStatus(id, request));
    }
}
