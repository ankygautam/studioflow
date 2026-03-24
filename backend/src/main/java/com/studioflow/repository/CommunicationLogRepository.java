package com.studioflow.repository;

import com.studioflow.entity.CommunicationLog;
import com.studioflow.enums.CommunicationDeliveryStatus;
import com.studioflow.enums.CommunicationEventType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, UUID> {

    boolean existsByAppointmentIdAndEventTypeAndDeliveryStatusAndSentAtAfter(
        UUID appointmentId,
        CommunicationEventType eventType,
        CommunicationDeliveryStatus deliveryStatus,
        Instant sentAt
    );

    Optional<CommunicationLog> findTopByAppointmentIdAndEventTypeAndDeliveryStatusOrderBySentAtDesc(
        UUID appointmentId,
        CommunicationEventType eventType,
        CommunicationDeliveryStatus deliveryStatus
    );
}
