package com.studioflow.entity;

import com.studioflow.enums.CommunicationChannel;
import com.studioflow.enums.CommunicationDeliveryStatus;
import com.studioflow.enums.CommunicationEventType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "communication_logs")
@Getter
@Setter
@NoArgsConstructor
public class CommunicationLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 64)
    private CommunicationEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 24)
    private CommunicationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 24)
    private CommunicationDeliveryStatus deliveryStatus;

    @Column(name = "target", nullable = false, length = 160)
    private String target;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "error_message", length = 255)
    private String errorMessage;
}
