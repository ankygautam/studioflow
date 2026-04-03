package com.studioflow.service;

import com.studioflow.dto.packages.PrepaidPackageCreateRequest;
import com.studioflow.dto.packages.PrepaidPackageResponse;
import com.studioflow.dto.packages.PrepaidPackageUpdateRequest;
import com.studioflow.entity.PrepaidPackage;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.PrepaidPackageRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class PrepaidPackageService {

    private final CurrentUserService currentUserService;
    private final PrepaidPackageRepository prepaidPackageRepository;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    public PrepaidPackageResponse createPackage(PrepaidPackageCreateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        PrepaidPackage prepaidPackage = new PrepaidPackage();
        mapRequest(prepaidPackage, request, studio, request.isActive() != null ? request.isActive() : Boolean.TRUE);

        PrepaidPackage savedPackage = prepaidPackageRepository.save(prepaidPackage);
        auditLogService.log(
            AuditEntityType.PACKAGE,
            savedPackage.getId(),
            AuditActionType.CREATED,
            savedPackage.getStudio().getId(),
            null,
            "Package created",
            savedPackage.getName() + " was added to the package catalog."
        );
        return toResponse(savedPackage);
    }

    @Transactional(readOnly = true)
    public List<PrepaidPackageResponse> getAllPackages(UUID studioId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        return prepaidPackageRepository.findByStudioId(authorizedStudioId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public PrepaidPackageResponse getPackageById(UUID id) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        PrepaidPackage prepaidPackage = findPackage(id);
        currentUserService.ensureStudioAccess(prepaidPackage.getStudio().getId());
        return toResponse(prepaidPackage);
    }

    public PrepaidPackageResponse updatePackage(UUID id, PrepaidPackageUpdateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN);
        PrepaidPackage prepaidPackage = findPackage(id);
        currentUserService.ensureStudioAccess(prepaidPackage.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        mapRequest(prepaidPackage, request, studio, request.isActive() != null ? request.isActive() : prepaidPackage.getIsActive());

        PrepaidPackage savedPackage = prepaidPackageRepository.save(prepaidPackage);
        auditLogService.log(
            AuditEntityType.PACKAGE,
            savedPackage.getId(),
            AuditActionType.UPDATED,
            savedPackage.getStudio().getId(),
            null,
            "Package updated",
            savedPackage.getName() + " was updated in the package catalog."
        );
        return toResponse(savedPackage);
    }

    public void deletePackage(UUID id) {
        currentUserService.requireAnyRole(UserRole.ADMIN);
        PrepaidPackage prepaidPackage = findPackage(id);
        currentUserService.ensureStudioAccess(prepaidPackage.getStudio().getId());
        prepaidPackage.setIsActive(false);
        prepaidPackageRepository.save(prepaidPackage);
        auditLogService.log(
            AuditEntityType.PACKAGE,
            prepaidPackage.getId(),
            AuditActionType.DEACTIVATED,
            prepaidPackage.getStudio().getId(),
            null,
            "Package deactivated",
            prepaidPackage.getName() + " was deactivated."
        );
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private PrepaidPackage findPackage(UUID id) {
        return prepaidPackageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + id));
    }

    private void mapRequest(
        PrepaidPackage prepaidPackage,
        PrepaidPackageCreateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        prepaidPackage.setStudio(studio);
        prepaidPackage.setName(request.name().trim());
        prepaidPackage.setDescription(normalize(request.description()));
        prepaidPackage.setSessionCount(request.sessionCount());
        prepaidPackage.setPrice(request.price());
        prepaidPackage.setExpiresAfterDays(request.expiresAfterDays());
        prepaidPackage.setIsActive(isActive);
    }

    private void mapRequest(
        PrepaidPackage prepaidPackage,
        PrepaidPackageUpdateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        prepaidPackage.setStudio(studio);
        prepaidPackage.setName(request.name().trim());
        prepaidPackage.setDescription(normalize(request.description()));
        prepaidPackage.setSessionCount(request.sessionCount());
        prepaidPackage.setPrice(request.price());
        prepaidPackage.setExpiresAfterDays(request.expiresAfterDays());
        prepaidPackage.setIsActive(isActive);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private PrepaidPackageResponse toResponse(PrepaidPackage prepaidPackage) {
        return new PrepaidPackageResponse(
            prepaidPackage.getId(),
            prepaidPackage.getStudio().getId(),
            prepaidPackage.getName(),
            prepaidPackage.getDescription(),
            prepaidPackage.getSessionCount(),
            prepaidPackage.getPrice(),
            prepaidPackage.getExpiresAfterDays(),
            prepaidPackage.getIsActive(),
            prepaidPackage.getCreatedAt(),
            prepaidPackage.getUpdatedAt()
        );
    }
}
