package com.studioflow.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.studioflow.dto.audit.AuditLogResponse;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.AuditLog;
import com.studioflow.entity.Location;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.AuditLogRepository;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int MAX_LIMIT = 100;

    private final AuditLogRepository auditLogRepository;
    private final StudioRepository studioRepository;
    private final LocationRepository locationRepository;
    private final AppointmentRepository appointmentRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogs(
        UUID locationId,
        AuditEntityType entityType,
        AuditActionType actionType,
        UUID actorUserId,
        Instant from,
        Instant to,
        Integer limit
    ) {
        currentUserService.requireAnyRole(UserRole.ADMIN);
        UUID studioId = currentUserService.getCurrentStudioId();
        UUID authorizedLocationId = locationId != null ? currentUserService.requireLocationAccess(locationId) : null;
        PageRequest pageRequest = PageRequest.of(0, normalizeLimit(limit));
        List<AuditLog> auditLogs;

        if (actionType != null) {
            auditLogs = auditLogRepository.findByStudioIdAndActionTypeOrderByCreatedAtDesc(studioId, actionType, pageRequest);
        } else if (actorUserId != null) {
            auditLogs = auditLogRepository.findByStudioIdAndActorUserIdOrderByCreatedAtDesc(studioId, actorUserId, pageRequest);
        } else if (from != null || to != null) {
            Instant fromValue = from != null ? from : Instant.EPOCH;
            Instant toValue = to != null ? to : Instant.now().plusSeconds(86400);
            auditLogs = auditLogRepository.findByStudioIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                studioId,
                fromValue,
                toValue,
                pageRequest
            );
        } else if (authorizedLocationId != null && entityType != null) {
            auditLogs = auditLogRepository.findByStudioIdAndLocationIdAndEntityTypeOrderByCreatedAtDesc(
                studioId,
                authorizedLocationId,
                entityType,
                pageRequest
            );
        } else if (authorizedLocationId != null) {
            auditLogs = auditLogRepository.findByStudioIdAndLocationIdOrderByCreatedAtDesc(
                studioId,
                authorizedLocationId,
                pageRequest
            );
        } else if (entityType != null) {
            auditLogs = auditLogRepository.findByStudioIdAndEntityTypeOrderByCreatedAtDesc(
                studioId,
                entityType,
                pageRequest
            );
        } else {
            auditLogs = auditLogRepository.findByStudioIdOrderByCreatedAtDesc(studioId, pageRequest);
        }

        if (authorizedLocationId != null && actionType != null) {
            auditLogs = auditLogs.stream()
                .filter((entry) -> entry.getLocation() != null && authorizedLocationId.equals(entry.getLocation().getId()))
                .toList();
        }

        if (authorizedLocationId != null && actorUserId != null) {
            auditLogs = auditLogs.stream()
                .filter((entry) -> entry.getLocation() != null && authorizedLocationId.equals(entry.getLocation().getId()))
                .toList();
        }

        if (entityType != null && (actionType != null || actorUserId != null || from != null || to != null)) {
            auditLogs = auditLogs.stream()
                .filter((entry) -> entry.getEntityType() == entityType)
                .toList();
        }

        return auditLogs.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(UUID id) {
        currentUserService.requireAnyRole(UserRole.ADMIN);
        UUID studioId = currentUserService.getCurrentStudioId();
        AuditLog auditLog = auditLogRepository.findByIdAndStudioId(id, studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Audit log not found: " + id));
        return toResponse(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsForEntity(AuditEntityType entityType, UUID entityId, UUID locationId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        enforceEntityTimelineAccess(entityType, entityId);
        UUID studioId = currentUserService.getCurrentStudioId();
        UUID authorizedLocationId = locationId != null ? currentUserService.requireLocationAccess(locationId) : null;
        List<AuditLog> auditLogs = authorizedLocationId != null
            ? auditLogRepository.findByStudioIdAndLocationIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
                studioId,
                authorizedLocationId,
                entityType,
                entityId
            )
            : auditLogRepository.findByStudioIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(studioId, entityType, entityId);

        return auditLogs.stream().map(this::toResponse).toList();
    }

    private void enforceEntityTimelineAccess(AuditEntityType entityType, UUID entityId) {
        if (!currentUserService.hasRole(UserRole.STAFF)) {
            return;
        }

        if (entityType != AuditEntityType.APPOINTMENT) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot view audit history for this record");
        }

        Appointment appointment = appointmentRepository.findById(entityId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + entityId));
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        currentUserService.ensureAssignedStaff(appointment.getStaffProfile());
    }

    public void log(
        AuditEntityType entityType,
        UUID entityId,
        AuditActionType actionType,
        UUID studioId,
        UUID locationId,
        String title,
        String description
    ) {
        log(entityType, entityId, actionType, studioId, locationId, title, description, null);
    }

    public void log(
        AuditEntityType entityType,
        UUID entityId,
        AuditActionType actionType,
        UUID studioId,
        UUID locationId,
        String title,
        String description,
        Object metadata
    ) {
        AuditLog auditLog = new AuditLog();
        auditLog.setStudio(findStudio(studioId));
        auditLog.setLocation(findLocation(locationId));
        auditLog.setActorUserId(currentUserService.getCurrentUserId());
        auditLog.setActorName(currentUserService.getCurrentUserName());
        auditLog.setActorRole(currentUserService.getCurrentUserRole());
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setActionType(actionType);
        auditLog.setTitle(title);
        auditLog.setDescription(description);
        auditLog.setMetadataJson(serializeMetadata(metadata));
        auditLogRepository.save(auditLog);
    }

    public void logAsActor(
        User actor,
        UUID studioId,
        UUID locationId,
        AuditEntityType entityType,
        UUID entityId,
        AuditActionType actionType,
        String title,
        String description
    ) {
        AuditLog auditLog = new AuditLog();
        auditLog.setStudio(findStudio(studioId));
        auditLog.setLocation(findLocation(locationId));
        auditLog.setActorUserId(actor.getId());
        auditLog.setActorName(actor.getFullName());
        auditLog.setActorRole(actor.getRole());
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setActionType(actionType);
        auditLog.setTitle(title);
        auditLog.setDescription(description);
        auditLogRepository.save(auditLog);
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        return new AuditLogResponse(
            auditLog.getId(),
            auditLog.getStudio().getId(),
            auditLog.getLocation() != null ? auditLog.getLocation().getId() : null,
            auditLog.getLocation() != null ? auditLog.getLocation().getName() : null,
            auditLog.getActorUserId(),
            auditLog.getActorName(),
            auditLog.getActorRole(),
            auditLog.getEntityType(),
            auditLog.getEntityId(),
            auditLog.getActionType(),
            auditLog.getTitle(),
            auditLog.getDescription(),
            auditLog.getMetadataJson(),
            auditLog.getCreatedAt()
        );
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private Location findLocation(UUID locationId) {
        if (locationId == null) {
            return null;
        }

        return locationRepository.findById(locationId)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + locationId));
    }

    private String serializeMetadata(Object metadata) {
        if (metadata == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Unable to serialize audit metadata");
        }
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }

        return Math.min(Math.max(limit, 1), MAX_LIMIT);
    }
}
