package com.studioflow.controller;

import com.studioflow.dto.audit.AuditLogResponse;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.service.AuditLogService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs(
        @RequestParam(required = false) UUID locationId,
        @RequestParam(required = false) AuditEntityType entityType,
        @RequestParam(required = false) AuditActionType actionType,
        @RequestParam(required = false) UUID actorUserId,
        @RequestParam(required = false) Instant from,
        @RequestParam(required = false) Instant to,
        @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(locationId, entityType, actionType, actorUserId, from, to, limit));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLogResponse> getAuditLogById(@PathVariable UUID id) {
        return ResponseEntity.ok(auditLogService.getAuditLogById(id));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsForEntity(
        @PathVariable AuditEntityType entityType,
        @PathVariable UUID entityId,
        @RequestParam(required = false) UUID locationId
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogsForEntity(entityType, entityId, locationId));
    }
}
