package com.studioflow.service;

import com.studioflow.dto.service.CreateServiceRequest;
import com.studioflow.dto.service.ServiceResponse;
import com.studioflow.dto.service.UpdateServiceRequest;
import com.studioflow.entity.Studio;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StudioRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final StudioRepository studioRepository;

    public ServiceResponse create(CreateServiceRequest request) {
        validateDeposit(request.depositRequired(), request.depositAmount());

        Studio studio = findStudio(request.studioId());
        com.studioflow.entity.Service service = new com.studioflow.entity.Service();
        mapRequest(service, request, studio, request.isActive() != null ? request.isActive() : Boolean.TRUE);

        return toResponse(serviceRepository.save(service));
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAll(UUID studioId) {
        List<com.studioflow.entity.Service> services = studioId == null
            ? serviceRepository.findAll()
            : serviceRepository.findByStudioId(studioId);

        return services.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getById(UUID id) {
        return toResponse(findService(id));
    }

    public ServiceResponse update(UUID id, UpdateServiceRequest request) {
        validateDeposit(request.depositRequired(), request.depositAmount());

        com.studioflow.entity.Service service = findService(id);
        Studio studio = findStudio(request.studioId());
        mapRequest(
            service,
            request,
            studio,
            request.isActive() != null ? request.isActive() : service.getIsActive()
        );

        return toResponse(serviceRepository.save(service));
    }

    public void deactivate(UUID id) {
        com.studioflow.entity.Service service = findService(id);
        service.setIsActive(false);
        serviceRepository.save(service);
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private com.studioflow.entity.Service findService(UUID id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private void mapRequest(
        com.studioflow.entity.Service service,
        CreateServiceRequest request,
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
        service.setDepositAmount(normalizeDepositAmount(request.depositAmount()));
        service.setIsActive(isActive);
    }

    private void mapRequest(
        com.studioflow.entity.Service service,
        UpdateServiceRequest request,
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
        service.setDepositAmount(normalizeDepositAmount(request.depositAmount()));
        service.setIsActive(isActive);
    }

    private void validateDeposit(Boolean depositRequired, BigDecimal depositAmount) {
        if (Boolean.TRUE.equals(depositRequired) && depositAmount == null) {
            throw new BadRequestException("depositAmount is required when depositRequired is true");
        }
    }

    private BigDecimal normalizeDepositAmount(BigDecimal depositAmount) {
        return depositAmount == null ? BigDecimal.ZERO : depositAmount;
    }

    private ServiceResponse toResponse(com.studioflow.entity.Service service) {
        return new ServiceResponse(
            service.getId(),
            service.getStudio().getId(),
            service.getStudio().getName(),
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
