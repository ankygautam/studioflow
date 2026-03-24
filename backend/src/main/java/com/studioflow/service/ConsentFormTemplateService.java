package com.studioflow.service;

import com.studioflow.dto.consent.ConsentFormTemplateCreateRequest;
import com.studioflow.dto.consent.ConsentFormTemplateResponse;
import com.studioflow.dto.consent.ConsentFormTemplateUpdateRequest;
import com.studioflow.entity.ConsentFormTemplate;
import com.studioflow.entity.Studio;
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

    public ConsentFormTemplateResponse createTemplate(ConsentFormTemplateCreateRequest request) {
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        ConsentFormTemplate template = new ConsentFormTemplate();
        mapRequest(template, request, studio);
        return toResponse(consentFormTemplateRepository.save(template));
    }

    @Transactional(readOnly = true)
    public List<ConsentFormTemplateResponse> getAllTemplates(UUID studioId) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<ConsentFormTemplate> templates = consentFormTemplateRepository.findByStudioId(authorizedStudioId);

        return templates.stream()
            .sorted(Comparator.comparing(ConsentFormTemplate::getUpdatedAt, Comparator.reverseOrder()))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ConsentFormTemplateResponse getTemplateById(UUID id) {
        ConsentFormTemplate template = findTemplate(id);
        currentUserService.ensureStudioAccess(template.getStudio().getId());
        return toResponse(template);
    }

    public ConsentFormTemplateResponse updateTemplate(UUID id, ConsentFormTemplateUpdateRequest request) {
        ConsentFormTemplate template = findTemplate(id);
        currentUserService.ensureStudioAccess(template.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        mapRequest(template, request, studio);
        return toResponse(consentFormTemplateRepository.save(template));
    }

    public void deleteTemplate(UUID id) {
        ConsentFormTemplate template = findTemplate(id);
        currentUserService.ensureStudioAccess(template.getStudio().getId());
        template.setIsActive(false);
        consentFormTemplateRepository.save(template);
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
