package com.studioflow.repository;

import com.studioflow.entity.CommunicationLog;
import com.studioflow.enums.CommunicationDeliveryStatus;
import com.studioflow.enums.CommunicationEventType;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, UUID> {

    void deleteByAppointmentId(UUID appointmentId);

    boolean existsByAppointmentIdAndEventTypeAndDeliveryStatusAndSentAtAfter(
        UUID appointmentId,
        CommunicationEventType eventType,
        CommunicationDeliveryStatus deliveryStatus,
        Instant sentAt
    );

    boolean existsByAppointmentIdAndEventTypeAndDeliveryStatusAndReminderOffsetHoursAndSentAtAfter(
        UUID appointmentId,
        CommunicationEventType eventType,
        CommunicationDeliveryStatus deliveryStatus,
        Integer reminderOffsetHours,
        Instant sentAt
    );

    Optional<CommunicationLog> findTopByAppointmentIdAndEventTypeAndDeliveryStatusOrderBySentAtDesc(
        UUID appointmentId,
        CommunicationEventType eventType,
        CommunicationDeliveryStatus deliveryStatus
    );
}
