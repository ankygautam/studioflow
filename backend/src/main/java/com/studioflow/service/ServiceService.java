package com.studioflow.service;

import com.studioflow.dto.service.ServiceCreateRequest;
import com.studioflow.dto.service.ServiceResponse;
import com.studioflow.dto.service.ServiceUpdateRequest;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceService {

    private final CurrentUserService currentUserService;
    private final ServiceRepository serviceRepository;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    public ServiceResponse createService(ServiceCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        validateDeposit(request.depositRequired(), request.depositAmount());

        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        com.studioflow.entity.Service service = new com.studioflow.entity.Service();
        mapCreateRequest(
            service,
            request,
            studio,
            request.isActive() != null ? request.isActive() : Boolean.TRUE
        );

        com.studioflow.entity.Service savedService = serviceRepository.save(service);
        auditLogService.log(
            AuditEntityType.SERVICE,
            savedService.getId(),
            AuditActionType.CREATED,
            savedService.getStudio().getId(),
            null,
            "Service created",
            savedService.getName() + " was added to the service catalog."
        );
        return toResponse(savedService);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices(UUID studioId) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<com.studioflow.entity.Service> services = serviceRepository.findByStudioId(authorizedStudioId);

        return services.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(UUID id) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        com.studioflow.entity.Service service = findService(id);
        currentUserService.ensureStudioAccess(service.getStudio().getId());
        return toResponse(service);
    }

    public ServiceResponse updateService(UUID id, ServiceUpdateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        validateDeposit(request.depositRequired(), request.depositAmount());

        com.studioflow.entity.Service service = findService(id);
        currentUserService.ensureStudioAccess(service.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        mapUpdateRequest(
            service,
            request,
            studio,
            request.isActive() != null ? request.isActive() : service.getIsActive()
        );

        com.studioflow.entity.Service savedService = serviceRepository.save(service);
        auditLogService.log(
            AuditEntityType.SERVICE,
            savedService.getId(),
            AuditActionType.UPDATED,
            savedService.getStudio().getId(),
            null,
            "Service updated",
            savedService.getName() + " was updated in the service catalog."
        );
        return toResponse(savedService);
    }

    public void deleteService(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        com.studioflow.entity.Service service = findService(id);
        currentUserService.ensureStudioAccess(service.getStudio().getId());
        service.setIsActive(false);
        serviceRepository.save(service);
        auditLogService.log(
            AuditEntityType.SERVICE,
            service.getId(),
            AuditActionType.DEACTIVATED,
            service.getStudio().getId(),
            null,
            "Service deactivated",
            service.getName() + " was deactivated."
        );
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private com.studioflow.entity.Service findService(UUID id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private void mapCreateRequest(
        com.studioflow.entity.Service service,
        ServiceCreateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        service.setStudio(studio);
        service.setName(request.name());
        service.setCategory(request.category());
        service.setDescription(request.description());
        service.setDurationMinutes(request.durationMinutes());
        service.setPrice(request.price());
        service.setDepositRequired(request.depositRequired());
        service.setDepositAmount(normalizeDepositAmount(request.depositRequired(), request.depositAmount()));
        service.setIsActive(isActive);
    }

    private void mapUpdateRequest(
        com.studioflow.entity.Service service,
        ServiceUpdateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        service.setStudio(studio);
        service.setName(request.name());
        service.setCategory(request.category());
        service.setDescription(request.description());
        service.setDurationMinutes(request.durationMinutes());
        service.setPrice(request.price());
        service.setDepositRequired(request.depositRequired());
        service.setDepositAmount(normalizeDepositAmount(request.depositRequired(), request.depositAmount()));
        service.setIsActive(isActive);
    }

    private void validateDeposit(Boolean depositRequired, BigDecimal depositAmount) {
        if (Boolean.TRUE.equals(depositRequired) && depositAmount == null) {
            throw new BadRequestException("depositAmount is required when depositRequired is true");
        }
    }

    private BigDecimal normalizeDepositAmount(Boolean depositRequired, BigDecimal depositAmount) {
        if (!Boolean.TRUE.equals(depositRequired)) {
            return BigDecimal.ZERO;
        }

        return depositAmount == null ? BigDecimal.ZERO : depositAmount;
    }

    private ServiceResponse toResponse(com.studioflow.entity.Service service) {
        return new ServiceResponse(
            service.getId(),
            service.getStudio().getId(),
            service.getName(),
            service.getCategory(),
            service.getDescription(),
            service.getDurationMinutes(),
            service.getPrice(),
            service.getDepositRequired(),
            service.getDepositAmount(),
            service.getIsActive(),
            service.getCreatedAt(),
            service.getUpdatedAt()
        );
    }
}
