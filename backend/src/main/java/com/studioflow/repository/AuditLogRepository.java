package com.studioflow.repository;

import com.studioflow.entity.AuditLog;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByStudioIdOrderByCreatedAtDesc(UUID studioId, Pageable pageable);

    List<AuditLog> findByStudioIdAndLocationIdOrderByCreatedAtDesc(UUID studioId, UUID locationId, Pageable pageable);

    List<AuditLog> findByStudioIdAndEntityTypeOrderByCreatedAtDesc(
        UUID studioId,
        AuditEntityType entityType,
        Pageable pageable
    );

    List<AuditLog> findByStudioIdAndLocationIdAndEntityTypeOrderByCreatedAtDesc(
        UUID studioId,
        UUID locationId,
        AuditEntityType entityType,
        Pageable pageable
    );

    Optional<AuditLog> findByIdAndStudioId(UUID id, UUID studioId);

    List<AuditLog> findByStudioIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
        UUID studioId,
        AuditEntityType entityType,
        UUID entityId
    );

    List<AuditLog> findByStudioIdAndLocationIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
        UUID studioId,
        UUID locationId,
        AuditEntityType entityType,
        UUID entityId
    );

    List<AuditLog> findByStudioIdAndActionTypeOrderByCreatedAtDesc(
        UUID studioId,
        AuditActionType actionType,
        Pageable pageable
    );

    List<AuditLog> findByStudioIdAndActorUserIdOrderByCreatedAtDesc(
        UUID studioId,
        UUID actorUserId,
        Pageable pageable
    );

    List<AuditLog> findByStudioIdAndCreatedAtBetweenOrderByCreatedAtDesc(
        UUID studioId,
        Instant from,
        Instant to,
        Pageable pageable
    );
}
