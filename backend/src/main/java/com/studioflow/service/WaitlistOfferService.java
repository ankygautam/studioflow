package com.studioflow.service;

import com.studioflow.dto.waitlist.WaitlistSlotOfferCreateRequest;
import com.studioflow.dto.waitlist.WaitlistSlotOfferResponse;
import com.studioflow.dto.waitlist.WaitlistSlotOfferStatusUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.WaitlistEntry;
import com.studioflow.entity.WaitlistSlotOffer;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.enums.WaitlistOfferStatus;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.WaitlistEntryRepository;
import com.studioflow.repository.WaitlistSlotOfferRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class WaitlistOfferService {

    private final CurrentUserService currentUserService;
    private final WaitlistSlotOfferRepository waitlistSlotOfferRepository;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final AppointmentRepository appointmentRepository;
    private final WaitlistService waitlistService;
    private final AuditLogService auditLogService;

    public WaitlistSlotOfferResponse createOffer(WaitlistSlotOfferCreateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST);

        Appointment cancelledAppointment = findDetailedAppointment(request.cancelledAppointmentId());
        WaitlistEntry waitlistEntry = findWaitlistEntry(request.waitlistEntryId());

        currentUserService.ensureStudioAccess(cancelledAppointment.getStudio().getId());
        currentUserService.ensureStudioAccess(waitlistEntry.getStudio().getId());
        waitlistService.validateCancelledAppointment(cancelledAppointment);

        if (!Boolean.TRUE.equals(waitlistEntry.getIsActive())) {
            throw new BadRequestException("Only active waitlist entries can receive slot offers");
        }

        if (!waitlistService.matchesCancelledAppointmentSuggestion(waitlistEntry, cancelledAppointment)) {
            throw new BadRequestException("This waitlist entry is not eligible for the cancelled slot");
        }

        expirePendingOffers(cancelledAppointment.getId());

        waitlistSlotOfferRepository
            .findTopByCancelledAppointmentIdAndWaitlistEntryIdOrderByCreatedAtDesc(cancelledAppointment.getId(), waitlistEntry.getId())
            .ifPresent((existingOffer) -> {
                if (existingOffer.getStatus() != WaitlistOfferStatus.DECLINED
                    && existingOffer.getStatus() != WaitlistOfferStatus.EXPIRED) {
                    throw new BadRequestException("An active slot offer already exists for this waitlist client");
                }
            });

        WaitlistSlotOffer offer = new WaitlistSlotOffer();
        offer.setStudio(cancelledAppointment.getStudio());
        offer.setWaitlistEntry(waitlistEntry);
        offer.setCancelledAppointment(cancelledAppointment);
        offer.setStatus(WaitlistOfferStatus.SENT);
        offer.setExpiresAt(resolveExpiry(request.expiresAt()));
        offer.setRespondedAt(null);

        WaitlistSlotOffer savedOffer = waitlistSlotOfferRepository.save(offer);
        auditLogService.log(
            AuditEntityType.WAITLIST_OFFER,
            savedOffer.getId(),
            AuditActionType.CREATED,
            savedOffer.getStudio().getId(),
            savedOffer.getCancelledAppointment().getLocation().getId(),
            "Waitlist offer sent",
            "A cancelled slot offer was sent to " + savedOffer.getWaitlistEntry().getCustomerProfile().getFullName() + "."
        );
        return toResponse(savedOffer);
    }

    @Transactional(readOnly = true)
    public List<WaitlistSlotOfferResponse> getOffers(UUID cancelledAppointmentId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        Appointment cancelledAppointment = findDetailedAppointment(cancelledAppointmentId);
        currentUserService.ensureStudioAccess(cancelledAppointment.getStudio().getId());

        expirePendingOffers(cancelledAppointment.getId());

        return waitlistSlotOfferRepository.findByCancelledAppointmentIdOrderByCreatedAtDesc(cancelledAppointmentId).stream()
            .map(this::toResponse)
            .toList();
    }

    public WaitlistSlotOfferResponse updateOfferStatus(UUID id, WaitlistSlotOfferStatusUpdateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST);
        WaitlistSlotOffer offer = findOffer(id);
        currentUserService.ensureStudioAccess(offer.getStudio().getId());

        expireOfferIfNeeded(offer);
        validateStatusTransition(offer, request.status());

        Appointment convertedAppointment = null;
        if (request.status() == WaitlistOfferStatus.CONVERTED && request.convertedAppointmentId() != null) {
            convertedAppointment = findDetailedAppointment(request.convertedAppointmentId());
            validateConvertedAppointment(offer, convertedAppointment);
        }

        offer.setStatus(request.status());
        offer.setConvertedAppointment(convertedAppointment);
        offer.setRespondedAt(Instant.now());

        WaitlistSlotOffer savedOffer = waitlistSlotOfferRepository.save(offer);
        auditLogService.log(
            AuditEntityType.WAITLIST_OFFER,
            savedOffer.getId(),
            AuditActionType.STATUS_CHANGED,
            savedOffer.getStudio().getId(),
            savedOffer.getCancelledAppointment().getLocation().getId(),
            "Waitlist offer status changed",
            "The slot offer for " + savedOffer.getWaitlistEntry().getCustomerProfile().getFullName()
                + " was marked " + savedOffer.getStatus().name().toLowerCase() + "."
        );
        return toResponse(savedOffer);
    }

    private Appointment findDetailedAppointment(UUID id) {
        return appointmentRepository.findDetailedById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private WaitlistEntry findWaitlistEntry(UUID id) {
        return waitlistEntryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found: " + id));
    }

    private WaitlistSlotOffer findOffer(UUID id) {
        return waitlistSlotOfferRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Waitlist slot offer not found: " + id));
    }

    private Instant resolveExpiry(Instant requestedExpiry) {
        Instant minimumExpiry = Instant.now().plus(15, ChronoUnit.MINUTES);

        if (requestedExpiry == null) {
            return Instant.now().plus(24, ChronoUnit.HOURS);
        }

        if (requestedExpiry.isBefore(minimumExpiry)) {
            throw new BadRequestException("Slot offers must stay open for at least 15 minutes");
        }

        return requestedExpiry;
    }

    private void validateStatusTransition(WaitlistSlotOffer offer, WaitlistOfferStatus nextStatus) {
        if (nextStatus == null) {
            throw new BadRequestException("Offer status is required");
        }

        WaitlistOfferStatus currentStatus = offer.getStatus();

        if (currentStatus == WaitlistOfferStatus.SENT) {
            if (nextStatus == WaitlistOfferStatus.ACCEPTED
                || nextStatus == WaitlistOfferStatus.DECLINED
                || nextStatus == WaitlistOfferStatus.EXPIRED) {
                return;
            }
        }

        if (currentStatus == WaitlistOfferStatus.ACCEPTED) {
            if (nextStatus == WaitlistOfferStatus.CONVERTED || nextStatus == WaitlistOfferStatus.DECLINED) {
                return;
            }
        }

        throw new BadRequestException("This offer can no longer move to the requested status");
    }

    private void validateConvertedAppointment(WaitlistSlotOffer offer, Appointment convertedAppointment) {
        currentUserService.ensureStudioAccess(convertedAppointment.getStudio().getId());

        if (!convertedAppointment.getCustomerProfile().getId().equals(offer.getWaitlistEntry().getCustomerProfile().getId())) {
            throw new BadRequestException("Converted bookings must belong to the same client as the slot offer");
        }

        if (!convertedAppointment.getLocation().getId().equals(offer.getCancelledAppointment().getLocation().getId())) {
            throw new BadRequestException("Converted bookings must stay in the same location");
        }

        if (!convertedAppointment.getService().getId().equals(offer.getCancelledAppointment().getService().getId())) {
            throw new BadRequestException("Converted bookings must match the same service");
        }
    }

    private void expirePendingOffers(UUID cancelledAppointmentId) {
        List<WaitlistSlotOffer> expiredOffers = waitlistSlotOfferRepository
            .findByCancelledAppointmentIdAndStatusAndExpiresAtBefore(
                cancelledAppointmentId,
                WaitlistOfferStatus.SENT,
                Instant.now()
            );

        if (expiredOffers.isEmpty()) {
            return;
        }

        Instant now = Instant.now();
        expiredOffers.forEach((offer) -> {
            offer.setStatus(WaitlistOfferStatus.EXPIRED);
            offer.setRespondedAt(now);
        });
        waitlistSlotOfferRepository.saveAll(expiredOffers);
    }

    private void expireOfferIfNeeded(WaitlistSlotOffer offer) {
        if (offer.getStatus() == WaitlistOfferStatus.SENT && offer.getExpiresAt().isBefore(Instant.now())) {
            offer.setStatus(WaitlistOfferStatus.EXPIRED);
            offer.setRespondedAt(Instant.now());
            waitlistSlotOfferRepository.save(offer);
        }
    }

    private WaitlistSlotOfferResponse toResponse(WaitlistSlotOffer offer) {
        return new WaitlistSlotOfferResponse(
            offer.getId(),
            offer.getStudio().getId(),
            offer.getWaitlistEntry().getId(),
            offer.getCancelledAppointment().getId(),
            offer.getConvertedAppointment() != null ? offer.getConvertedAppointment().getId() : null,
            offer.getWaitlistEntry().getCustomerProfile().getId(),
            offer.getWaitlistEntry().getCustomerProfile().getFullName(),
            offer.getStatus(),
            offer.getExpiresAt(),
            offer.getRespondedAt(),
            offer.getCreatedAt(),
            offer.getUpdatedAt()
        );
    }
}
