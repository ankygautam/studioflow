package com.studioflow.controller;

import com.studioflow.dto.booking.PublicBookingAvailabilityResponse;
import com.studioflow.dto.booking.PublicBookingCancelRequest;
import com.studioflow.dto.booking.PublicBookingConfirmationResponse;
import com.studioflow.dto.booking.PublicBookingCreateRequest;
import com.studioflow.dto.booking.PublicBookingLookupRequest;
import com.studioflow.dto.booking.PublicBookingLookupResponse;
import com.studioflow.dto.booking.PublicBookingManageResponse;
import com.studioflow.dto.booking.PublicBookingRescheduleRequest;
import com.studioflow.dto.booking.PublicBookingServicesResponse;
import com.studioflow.dto.booking.PublicBookingStaffResponse;
import com.studioflow.service.PublicBookingService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/public/booking")
@RequiredArgsConstructor
public class PublicBookingController {

    private final PublicBookingService publicBookingService;

    @GetMapping("/{studioSlug}/services")
    public ResponseEntity<PublicBookingServicesResponse> getServices(
        @PathVariable String studioSlug
    ) {
        return ResponseEntity.ok(publicBookingService.getServices(studioSlug));
    }

    @GetMapping("/{studioSlug}/staff")
    public ResponseEntity<PublicBookingStaffResponse> getStaff(
        @PathVariable String studioSlug,
        @RequestParam UUID serviceId,
        @RequestParam UUID locationId
    ) {
        return ResponseEntity.ok(publicBookingService.getStaff(studioSlug, serviceId, locationId));
    }

    @GetMapping("/{studioSlug}/availability")
    public ResponseEntity<PublicBookingAvailabilityResponse> getAvailability(
        @PathVariable String studioSlug,
        @RequestParam UUID locationId,
        @RequestParam UUID serviceId,
        @RequestParam UUID staffProfileId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(publicBookingService.getAvailability(studioSlug, locationId, serviceId, staffProfileId, date));
    }

    @PostMapping("/{studioSlug}/submit")
    public ResponseEntity<PublicBookingConfirmationResponse> createBooking(
        @PathVariable String studioSlug,
        @Valid @RequestBody PublicBookingCreateRequest request
    ) {
        PublicBookingConfirmationResponse response = publicBookingService.createBooking(studioSlug, request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .location(URI.create("/api/public/booking/" + studioSlug + "/submit/" + response.appointmentId()))
            .body(response);
    }

    @PostMapping("/{studioSlug}/lookup")
    public ResponseEntity<PublicBookingLookupResponse> lookupBooking(
        @PathVariable String studioSlug,
        @Valid @RequestBody PublicBookingLookupRequest request
    ) {
        return ResponseEntity.ok(publicBookingService.lookupBooking(studioSlug, request));
    }

    @PostMapping("/{studioSlug}/cancel")
    public ResponseEntity<PublicBookingManageResponse> cancelBooking(
        @PathVariable String studioSlug,
        @Valid @RequestBody PublicBookingCancelRequest request
    ) {
        return ResponseEntity.ok(publicBookingService.cancelBooking(studioSlug, request));
    }

    @PostMapping("/{studioSlug}/reschedule")
    public ResponseEntity<PublicBookingManageResponse> rescheduleBooking(
        @PathVariable String studioSlug,
        @Valid @RequestBody PublicBookingRescheduleRequest request
    ) {
        return ResponseEntity.ok(publicBookingService.rescheduleBooking(studioSlug, request));
    }
}
