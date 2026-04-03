package com.studioflow.entity;

import com.studioflow.enums.WaitlistOfferStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "waitlist_slot_offers",
    indexes = {
        @Index(name = "idx_waitlist_offers_cancelled_appointment", columnList = "cancelled_appointment_id, created_at"),
        @Index(name = "idx_waitlist_offers_waitlist_entry", columnList = "waitlist_entry_id, created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class WaitlistSlotOffer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waitlist_entry_id", nullable = false)
    private WaitlistEntry waitlistEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_appointment_id", nullable = false)
    private Appointment cancelledAppointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "converted_appointment_id")
    private Appointment convertedAppointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private WaitlistOfferStatus status;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "responded_at")
    private Instant respondedAt;
}
