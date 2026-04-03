package com.studioflow.service;

import com.studioflow.dto.packages.ClientPackageAssignmentCreateRequest;
import com.studioflow.dto.packages.ClientPackageAssignmentResponse;
import com.studioflow.entity.ClientPackageAssignment;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.PrepaidPackage;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.ClientPackageAssignmentRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.PrepaidPackageRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ClientPackageAssignmentService {

    private final CurrentUserService currentUserService;
    private final ClientPackageAssignmentRepository clientPackageAssignmentRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PrepaidPackageRepository prepaidPackageRepository;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    public ClientPackageAssignmentResponse assignPackage(ClientPackageAssignmentCreateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        PrepaidPackage prepaidPackage = findPackage(request.prepaidPackageId());

        currentUserService.ensureStudioAccess(customerProfile.getStudio().getId());
        currentUserService.ensureStudioAccess(prepaidPackage.getStudio().getId());

        if (!studio.getId().equals(customerProfile.getStudio().getId()) || !studio.getId().equals(prepaidPackage.getStudio().getId())) {
            throw new BadRequestException("Package assignments must stay within the same studio");
        }

        if (!Boolean.TRUE.equals(prepaidPackage.getIsActive())) {
            throw new BadRequestException("Only active packages can be assigned to clients");
        }

        ClientPackageAssignment assignment = new ClientPackageAssignment();
        assignment.setStudio(studio);
        assignment.setCustomerProfile(customerProfile);
        assignment.setPrepaidPackage(prepaidPackage);
        assignment.setTotalSessions(prepaidPackage.getSessionCount());
        assignment.setRemainingSessions(prepaidPackage.getSessionCount());
        assignment.setExpiresAt(buildExpiryDate(prepaidPackage));
        assignment.setIsActive(Boolean.TRUE);

        ClientPackageAssignment savedAssignment = clientPackageAssignmentRepository.save(assignment);
        auditLogService.log(
            AuditEntityType.CLIENT_PACKAGE,
            savedAssignment.getId(),
            AuditActionType.ASSIGNED,
            savedAssignment.getStudio().getId(),
            null,
            "Package assigned",
            prepaidPackage.getName() + " was assigned to " + customerProfile.getFullName() + "."
        );
        return toResponse(savedAssignment);
    }

    @Transactional(readOnly = true)
    public List<ClientPackageAssignmentResponse> getAssignments(UUID customerProfileId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        CustomerProfile customerProfile = findCustomerProfile(customerProfileId);
        currentUserService.ensureStudioAccess(customerProfile.getStudio().getId());

        return clientPackageAssignmentRepository.findByCustomerProfileIdOrderByCreatedAtDesc(customerProfileId).stream()
            .map(this::toResponse)
            .toList();
    }

    private LocalDate buildExpiryDate(PrepaidPackage prepaidPackage) {
        if (prepaidPackage.getExpiresAfterDays() == null) {
            return null;
        }

        return LocalDate.now().plusDays(prepaidPackage.getExpiresAfterDays());
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private CustomerProfile findCustomerProfile(UUID id) {
        return customerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    private PrepaidPackage findPackage(UUID id) {
        return prepaidPackageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + id));
    }

    private ClientPackageAssignmentResponse toResponse(ClientPackageAssignment assignment) {
        return new ClientPackageAssignmentResponse(
            assignment.getId(),
            assignment.getStudio().getId(),
            assignment.getCustomerProfile().getId(),
            assignment.getCustomerProfile().getFullName(),
            assignment.getPrepaidPackage().getId(),
            assignment.getPrepaidPackage().getName(),
            assignment.getTotalSessions(),
            assignment.getRemainingSessions(),
            assignment.getExpiresAt(),
            assignment.getIsActive(),
            assignment.getCreatedAt(),
            assignment.getUpdatedAt()
        );
    }
}
