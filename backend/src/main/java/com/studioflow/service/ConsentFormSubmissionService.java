package com.studioflow.service;

import com.studioflow.dto.consent.ConsentFormSubmissionCreateRequest;
import com.studioflow.dto.consent.ConsentFormSubmissionResponse;
import com.studioflow.dto.consent.ConsentFormSubmissionUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.ConsentFormSubmission;
import com.studioflow.entity.ConsentFormTemplate;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Studio;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.ConsentFormSubmissionRepository;
import com.studioflow.repository.ConsentFormTemplateRepository;
import com.studioflow.repository.CustomerProfileRepository;
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
public class ConsentFormSubmissionService {

    private final CurrentUserService currentUserService;
    private final ConsentFormSubmissionRepository consentFormSubmissionRepository;
    private final ConsentFormTemplateRepository consentFormTemplateRepository;
    private final StudioRepository studioRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final AppointmentRepository appointmentRepository;

    public ConsentFormSubmissionResponse createSubmission(ConsentFormSubmissionCreateRequest request) {
        ConsentFormTemplate template = findTemplate(request.templateId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        CustomerProfile customerProfile = findCustomer(request.customerProfileId());
        Appointment appointment = findAppointment(request.appointmentId());

        validateRelationships(template, studio, customerProfile, appointment);

        ConsentFormSubmission submission = new ConsentFormSubmission();
        mapRequest(
            submission,
            request,
            template,
            studio,
            customerProfile,
            appointment
        );
        return toResponse(consentFormSubmissionRepository.save(submission));
    }

    @Transactional(readOnly = true)
    public List<ConsentFormSubmissionResponse> getAllSubmissions(
        UUID studioId,
        UUID customerProfileId,
        UUID appointmentId
    ) {
        List<ConsentFormSubmission> submissions;

        if (appointmentId != null) {
            Appointment appointment = findAppointment(appointmentId);
            currentUserService.ensureStudioAccess(appointment.getStudio().getId());
            submissions = consentFormSubmissionRepository.findByAppointmentId(appointmentId);
        } else if (customerProfileId != null) {
            CustomerProfile customerProfile = findCustomer(customerProfileId);
            currentUserService.ensureStudioAccess(customerProfile.getStudio().getId());
            submissions = consentFormSubmissionRepository.findByCustomerProfileId(customerProfileId);
        } else {
            UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
            submissions = consentFormSubmissionRepository.findByStudioId(authorizedStudioId);
        }

        return submissions.stream()
            .sorted(Comparator
                .comparing(ConsentFormSubmission::getSignedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(ConsentFormSubmission::getUpdatedAt, Comparator.reverseOrder()))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ConsentFormSubmissionResponse getSubmissionById(UUID id) {
        ConsentFormSubmission submission = findSubmission(id);
        currentUserService.ensureStudioAccess(submission.getStudio().getId());
        return toResponse(submission);
    }

    public ConsentFormSubmissionResponse updateSubmission(UUID id, ConsentFormSubmissionUpdateRequest request) {
        ConsentFormSubmission submission = findSubmission(id);
        currentUserService.ensureStudioAccess(submission.getStudio().getId());
        ConsentFormTemplate template = findTemplate(request.templateId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        CustomerProfile customerProfile = findCustomer(request.customerProfileId());
        Appointment appointment = findAppointment(request.appointmentId());

        validateRelationships(template, studio, customerProfile, appointment);

        mapRequest(
            submission,
            request,
            template,
            studio,
            customerProfile,
            appointment
        );
        return toResponse(consentFormSubmissionRepository.save(submission));
    }

    public void deleteSubmission(UUID id) {
        ConsentFormSubmission submission = findSubmission(id);
        currentUserService.ensureStudioAccess(submission.getStudio().getId());
        consentFormSubmissionRepository.delete(submission);
    }

    private ConsentFormTemplate findTemplate(UUID id) {
        return consentFormTemplateRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consent form template not found: " + id));
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private CustomerProfile findCustomer(UUID id) {
        return customerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    private Appointment findAppointment(UUID id) {
        if (id == null) {
            return null;
        }

        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private ConsentFormSubmission findSubmission(UUID id) {
        return consentFormSubmissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Consent form submission not found: " + id));
    }

    private void validateRelationships(
        ConsentFormTemplate template,
        Studio studio,
        CustomerProfile customerProfile,
        Appointment appointment
    ) {
        if (!template.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("The selected template does not belong to the selected studio");
        }

        if (!customerProfile.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("The selected customer does not belong to the selected studio");
        }

        if (appointment == null) {
            return;
        }

        if (!appointment.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("The selected appointment does not belong to the selected studio");
        }

        if (!appointment.getCustomerProfile().getId().equals(customerProfile.getId())) {
            throw new BadRequestException("The selected appointment does not belong to the selected customer");
        }
    }

    private void mapRequest(
        ConsentFormSubmission submission,
        ConsentFormSubmissionCreateRequest request,
        ConsentFormTemplate template,
        Studio studio,
        CustomerProfile customerProfile,
        Appointment appointment
    ) {
        submission.setTemplate(template);
        submission.setStudio(studio);
        submission.setCustomerProfile(customerProfile);
        submission.setAppointment(appointment);
        submission.setStatus(request.status());
        submission.setSignedAt(request.signedAt());
        submission.setSignatureImageUrl(normalize(request.signatureImageUrl()));
    }

    private void mapRequest(
        ConsentFormSubmission submission,
        ConsentFormSubmissionUpdateRequest request,
        ConsentFormTemplate template,
        Studio studio,
        CustomerProfile customerProfile,
        Appointment appointment
    ) {
        submission.setTemplate(template);
        submission.setStudio(studio);
        submission.setCustomerProfile(customerProfile);
        submission.setAppointment(appointment);
        submission.setStatus(request.status());
        submission.setSignedAt(request.signedAt());
        submission.setSignatureImageUrl(normalize(request.signatureImageUrl()));
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ConsentFormSubmissionResponse toResponse(ConsentFormSubmission submission) {
        Appointment appointment = submission.getAppointment();

        return new ConsentFormSubmissionResponse(
            submission.getId(),
            submission.getTemplate().getId(),
            submission.getStudio().getId(),
            submission.getCustomerProfile().getId(),
            appointment != null ? appointment.getId() : null,
            submission.getStatus(),
            submission.getSignedAt(),
            submission.getSignatureImageUrl(),
            submission.getCreatedAt(),
            submission.getUpdatedAt(),
            submission.getTemplate().getTitle(),
            submission.getCustomerProfile().getFullName(),
            appointment != null ? appointment.getAppointmentDate() : null,
            appointment != null ? appointment.getStartTime() : null,
            appointment != null ? appointment.getService().getName() : null
        );
    }
}
