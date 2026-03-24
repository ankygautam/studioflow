package com.studioflow.repository;

import com.studioflow.entity.Notification;
import com.studioflow.enums.NotificationType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    void deleteByAppointmentId(UUID appointmentId);

    List<Notification> findByStudioId(UUID studioId);

    List<Notification> findByUserId(UUID userId);

    List<Notification> findByUserIdAndIsReadFalse(UUID userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(UUID userId);

    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndAppointmentIdAndTypeAndCreatedAtAfter(
        UUID userId,
        UUID appointmentId,
        NotificationType type,
        Instant createdAt
    );
}
