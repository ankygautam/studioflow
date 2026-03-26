package com.studioflow.service;

import com.studioflow.dto.staff.StaffCreateRequest;
import com.studioflow.dto.staff.StaffResponse;
import com.studioflow.dto.staff.StaffUpdateRequest;
import com.studioflow.entity.Location;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.StaffStatus;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.repository.UserRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class StaffService {

    private final CurrentUserService currentUserService;
    private final StaffProfileRepository staffProfileRepository;
    private final UserRepository userRepository;
    private final StudioRepository studioRepository;
    private final LocationRepository locationRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    public StaffResponse createStaff(StaffCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location primaryLocation = findLocation(request.primaryLocationId());
        validateLocation(studio, primaryLocation);
        validateCreateRole(request.userRole());

        String normalizedEmail = request.userEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.displayName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.temporaryPassword()));
        user.setRole(request.userRole());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        StaffProfile staffProfile = new StaffProfile();
        mapCreateRequest(staffProfile, request, savedUser, studio, primaryLocation);

        StaffProfile savedStaffProfile = staffProfileRepository.save(staffProfile);
        auditLogService.log(
            AuditEntityType.STAFF,
            savedStaffProfile.getId(),
            AuditActionType.CREATED,
            savedStaffProfile.getStudio().getId(),
            savedStaffProfile.getPrimaryLocation() != null ? savedStaffProfile.getPrimaryLocation().getId() : null,
            "Staff profile created",
            savedStaffProfile.getDisplayName() + " was added to the team roster."
        );
        return toResponse(savedStaffProfile);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff(UUID studioId, UUID locationId) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        UUID authorizedLocationId = locationId != null ? currentUserService.requireLocationAccess(locationId) : null;
        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            StaffProfile currentStaffProfile = currentUserService.requireCurrentStaffProfile();

            if (authorizedLocationId != null && currentStaffProfile.getPrimaryLocation() != null) {
                currentUserService.ensureLocationAccess(authorizedLocationId);
            }

            return List.of(toResponse(currentStaffProfile));
        }

        List<StaffProfile> staffProfiles = authorizedLocationId != null
            ? staffProfileRepository.findByStudioIdAndPrimaryLocationId(authorizedStudioId, authorizedLocationId)
            : staffProfileRepository.findByStudioId(authorizedStudioId);

        return staffProfiles.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffById(UUID id) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        StaffProfile staffProfile = findStaffProfile(id);
        currentUserService.ensureStudioAccess(staffProfile.getStudio().getId());
        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            currentUserService.ensureAssignedStaff(staffProfile);
        }
        return toResponse(staffProfile);
    }

    public StaffResponse updateStaff(UUID id, StaffUpdateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        StaffProfile staffProfile = findStaffProfile(id);
        currentUserService.ensureStudioAccess(staffProfile.getStudio().getId());
        User user = findUser(request.userId());
        validateLinkedUser(user, staffProfile.getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location primaryLocation = findLocation(request.primaryLocationId());
        validateLocation(studio, primaryLocation);

        mapUpdateRequest(staffProfile, request, user, studio, primaryLocation);
        StaffProfile savedStaffProfile = staffProfileRepository.save(staffProfile);
        auditLogService.log(
            AuditEntityType.STAFF,
            savedStaffProfile.getId(),
            AuditActionType.UPDATED,
            savedStaffProfile.getStudio().getId(),
            savedStaffProfile.getPrimaryLocation() != null ? savedStaffProfile.getPrimaryLocation().getId() : null,
            "Staff profile updated",
            savedStaffProfile.getDisplayName() + " was updated."
        );
        return toResponse(savedStaffProfile);
    }

    public void deleteStaff(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        StaffProfile staffProfile = findStaffProfile(id);
        currentUserService.ensureStudioAccess(staffProfile.getStudio().getId());
        staffProfile.setStatus(StaffStatus.INACTIVE);
        staffProfileRepository.save(staffProfile);
        auditLogService.log(
            AuditEntityType.STAFF,
            staffProfile.getId(),
            AuditActionType.DEACTIVATED,
            staffProfile.getStudio().getId(),
            staffProfile.getPrimaryLocation() != null ? staffProfile.getPrimaryLocation().getId() : null,
            "Staff profile deactivated",
            staffProfile.getDisplayName() + " was marked inactive."
        );
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private StaffProfile findStaffProfile(UUID id) {
        return staffProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found: " + id));
    }

    private Location findLocation(UUID id) {
        if (id == null) {
            return null;
        }

        return locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
    }

    private void validateLinkedUser(User user, UUID currentStaffProfileId) {
        if (
            user.getStaffProfile() != null &&
            (currentStaffProfileId == null || !user.getStaffProfile().getId().equals(currentStaffProfileId))
        ) {
            throw new BadRequestException("This user is already linked to another staff profile");
        }
    }

    private void mapCreateRequest(
        StaffProfile staffProfile,
        StaffCreateRequest request,
        User user,
        Studio studio,
        Location primaryLocation
    ) {
        staffProfile.setUser(user);
        staffProfile.setStudio(studio);
        staffProfile.setPrimaryLocation(primaryLocation);
        staffProfile.setDisplayName(request.displayName());
        staffProfile.setJobTitle(resolveJobTitle(request.jobTitle(), request.userRole()));
        staffProfile.setPhone(request.phone());
        staffProfile.setBio(request.bio());
        staffProfile.setAvatarUrl(request.avatarUrl());
        staffProfile.setStatus(request.status());
    }

    private void mapUpdateRequest(
        StaffProfile staffProfile,
        StaffUpdateRequest request,
        User user,
        Studio studio,
        Location primaryLocation
    ) {
        staffProfile.setUser(user);
        staffProfile.setStudio(studio);
        staffProfile.setPrimaryLocation(primaryLocation);
        staffProfile.setDisplayName(request.displayName());
        staffProfile.setJobTitle(request.jobTitle());
        staffProfile.setPhone(request.phone());
        staffProfile.setBio(request.bio());
        staffProfile.setAvatarUrl(request.avatarUrl());
        staffProfile.setStatus(request.status());
    }

    private StaffResponse toResponse(StaffProfile staffProfile) {
        return new StaffResponse(
            staffProfile.getId(),
            staffProfile.getUser().getId(),
            staffProfile.getStudio().getId(),
            staffProfile.getPrimaryLocation() != null ? staffProfile.getPrimaryLocation().getId() : null,
            staffProfile.getDisplayName(),
            staffProfile.getJobTitle(),
            staffProfile.getPhone(),
            staffProfile.getBio(),
            staffProfile.getAvatarUrl(),
            staffProfile.getStatus(),
            staffProfile.getCreatedAt(),
            staffProfile.getUpdatedAt(),
            staffProfile.getUser().getFullName(),
            staffProfile.getUser().getEmail(),
            staffProfile.getUser().getRole(),
            staffProfile.getStudio().getName(),
            staffProfile.getPrimaryLocation() != null ? staffProfile.getPrimaryLocation().getName() : null
        );
    }

    private void validateLocation(Studio studio, Location location) {
        if (location != null && !location.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("The selected location does not belong to your studio");
        }
    }

    private void validateCreateRole(UserRole role) {
        if (role != UserRole.STAFF && role != UserRole.RECEPTIONIST) {
            throw new BadRequestException("Staff profiles can only create staff or receptionist accounts");
        }
    }

    private String resolveJobTitle(String requestedJobTitle, UserRole userRole) {
        if (requestedJobTitle != null && !requestedJobTitle.isBlank()) {
            return requestedJobTitle.trim();
        }

        return switch (userRole) {
            case RECEPTIONIST -> "Front Desk Coordinator";
            case STAFF -> "Service Artist";
            default -> "Team Member";
        };
    }
}
