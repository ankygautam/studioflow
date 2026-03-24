package com.studioflow.service;

import com.studioflow.dto.consent.ConsentFormTemplateCreateRequest;
import com.studioflow.dto.consent.ConsentFormTemplateResponse;
import com.studioflow.dto.consent.ConsentFormTemplateUpdateRequest;
import com.studioflow.entity.ConsentFormTemplate;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.ConsentFormTemplateRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ConsentFormTemplateService {

    private final CurrentUserService currentUserService;
    private final ConsentFormTemplateRepository consentFormTemplateRepository;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    public ConsentFormTemplateResponse createTemplate(ConsentFormTemplateCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        ConsentFormTemplate template = new ConsentFormTemplate();
        mapRequest(template, request, studio);
        ConsentFormTemplate savedTemplate = consentFormTemplateRepository.save(template);
        auditLogService.log(
            AuditEntityType.CONSENT_TEMPLATE,
            savedTemplate.getId(),
            AuditActionType.CREATED,
            savedTemplate.getStudio().getId(),
            null,
            "Consent template created",
            savedTemplate.getTitle() + " was added to consent templates."
        );
        return toResponse(savedTemplate);
    }

    @Transactional(readOnly = true)
    public List<ConsentFormTemplateResponse> getAllTemplates(UUID studioId) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<ConsentFormTemplate> templates = consentFormTemplateRepository.findByStudioId(authorizedStudioId);

        return templates.stream()
            .sorted(Comparator.comparing(ConsentFormTemplate::getUpdatedAt, Comparator.reverseOrder()))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ConsentFormTemplateResponse getTemplateById(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        ConsentFormTemplate template = findTemplate(id);
        currentUserService.ensureStudioAccess(template.getStudio().getId());
        return toResponse(template);
    }

    public ConsentFormTemplateResponse updateTemplate(UUID id, ConsentFormTemplateUpdateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        ConsentFormTemplate template = findTemplate(id);
        currentUserService.ensureStudioAccess(template.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        mapRequest(template, request, studio);
        ConsentFormTemplate savedTemplate = consentFormTemplateRepository.save(template);
        auditLogService.log(
            AuditEntityType.CONSENT_TEMPLATE,
            savedTemplate.getId(),
            AuditActionType.UPDATED,
            savedTemplate.getStudio().getId(),
            null,
            "Consent template updated",
            savedTemplate.getTitle() + " was updated."
        );
        return toResponse(savedTemplate);
    }

    public void deleteTemplate(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        ConsentFormTemplate template = findTemplate(id);
        currentUserService.ensureStudioAccess(template.getStudio().getId());
        template.setIsActive(false);
        consentFormTemplateRepository.save(template);
        auditLogService.log(
            AuditEntityType.CONSENT_TEMPLATE,
            template.getId(),
            AuditActionType.DEACTIVATED,
            template.getStudio().getId(),
            null,
            "Consent template deactivated",
            template.getTitle() + " was deactivated."
        );
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private ConsentFormTemplate findTemplate(UUID id) {
        return consentFormTemplateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consent form template not found: " + id));
    }

    private void mapRequest(ConsentFormTemplate template, ConsentFormTemplateCreateRequest request, Studio studio) {
        template.setStudio(studio);
        template.setTitle(request.title().trim());
        template.setDescription(normalize(request.description()));
        template.setContent(request.content().trim());
        template.setIsActive(request.isActive() == null ? Boolean.TRUE : request.isActive());
    }

    private void mapRequest(ConsentFormTemplate template, ConsentFormTemplateUpdateRequest request, Studio studio) {
        template.setStudio(studio);
        template.setTitle(request.title().trim());
        template.setDescription(normalize(request.description()));
        template.setContent(request.content().trim());
        template.setIsActive(request.isActive() == null ? Boolean.TRUE : request.isActive());
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ConsentFormTemplateResponse toResponse(ConsentFormTemplate template) {
        return new ConsentFormTemplateResponse(
            template.getId(),
            template.getStudio().getId(),
            template.getStudio().getName(),
            template.getTitle(),
            template.getDescription(),
            template.getContent(),
            Boolean.TRUE.equals(template.getIsActive()),
            template.getCreatedAt(),
            template.getUpdatedAt()
        );
    }
}
