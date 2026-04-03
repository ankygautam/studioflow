package com.studioflow.repository;

import com.studioflow.entity.WaitlistSlotOffer;
import com.studioflow.enums.WaitlistOfferStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WaitlistSlotOfferRepository extends JpaRepository<WaitlistSlotOffer, UUID> {

    List<WaitlistSlotOffer> findByCancelledAppointmentIdOrderByCreatedAtDesc(UUID cancelledAppointmentId);

    Optional<WaitlistSlotOffer> findTopByCancelledAppointmentIdAndWaitlistEntryIdOrderByCreatedAtDesc(
        UUID cancelledAppointmentId,
        UUID waitlistEntryId
    );

    List<WaitlistSlotOffer> findByCancelledAppointmentIdAndStatusAndExpiresAtBefore(
        UUID cancelledAppointmentId,
        WaitlistOfferStatus status,
        Instant expiresAt
    );
}
