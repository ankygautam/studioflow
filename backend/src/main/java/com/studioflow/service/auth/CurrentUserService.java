package com.studioflow.service.auth;

import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Location;
import com.studioflow.enums.UserRole;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.security.StudioFlowUserPrincipal;
import java.util.Arrays;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurrentUserService {

    private final LocationRepository locationRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StudioWorkspaceResolver studioWorkspaceResolver;

    public UUID getCurrentUserId() {
        return requirePrincipal().getId();
    }

    public UserRole getCurrentUserRole() {
        return requirePrincipal().getRole();
    }

    public String getCurrentUserName() {
        return requirePrincipal().getFullName();
    }

    public boolean hasRole(UserRole role) {
        UserRole currentRole = getCurrentUserRole();
        return currentRole == role || (currentRole == UserRole.OWNER && role == UserRole.ADMIN);
    }

    public void requireAnyRole(UserRole... roles) {
        UserRole currentRole = getCurrentUserRole();

        boolean allowed = Arrays.stream(roles).anyMatch((role) -> role == currentRole || (currentRole == UserRole.OWNER && role == UserRole.ADMIN));

        if (!allowed) {
            throw new AccessDeniedException("You do not have permission to perform this action");
        }
    }

    public UUID requireStudioAccess(UUID requestedStudioId) {
        UUID currentStudioId = getCurrentStudioId();

        if (requestedStudioId != null && !requestedStudioId.equals(currentStudioId)) {
            throw new AccessDeniedException("You cannot access another studio's records");
        }

        return currentStudioId;
    }

    public void ensureStudioAccess(UUID recordStudioId) {
        UUID currentStudioId = getCurrentStudioId();

        if (!currentStudioId.equals(recordStudioId)) {
            throw new AccessDeniedException("You cannot access another studio's records");
        }
    }

    public StaffProfile requireCurrentStaffProfile() {
        if (getCurrentUserRole() == UserRole.CUSTOMER) {
            throw new AccessDeniedException("Customers cannot access studio operations");
        }

        if (getCurrentUserRole() == UserRole.OWNER) {
            throw new AccessDeniedException("Studio owners do not use staff profiles for workspace access");
        }

        return staffProfileRepository.findByUserId(getCurrentUserId())
            .orElseThrow(() -> new AccessDeniedException("No studio is assigned to this account"));
    }

    public UUID getCurrentStudioId() {
        UUID studioId = studioWorkspaceResolver.resolveForUser(getCurrentUserId()).studioId();
        if (studioId == null) {
            throw new AccessDeniedException("No studio is assigned to this account");
        }
        return studioId;
    }

    public UUID getCurrentLocationId() {
        return studioWorkspaceResolver.resolveForUser(getCurrentUserId()).locationId();
    }

    public UUID requireLocationAccess(UUID requestedLocationId) {
        if (requestedLocationId == null) {
            return getCurrentLocationId();
        }

        ensureLocationAccess(requestedLocationId);
        return requestedLocationId;
    }

    public void ensureLocationAccess(UUID requestedLocationId) {
        if (getCurrentUserRole() == UserRole.OWNER || getCurrentUserRole() == UserRole.ADMIN) {
            if (requestedLocationId == null) {
                return;
            }

            Location location = locationRepository.findById(requestedLocationId)
                .orElseThrow(() -> new AccessDeniedException("Location was not found"));

            if (!location.getStudio().getId().equals(getCurrentStudioId())) {
                throw new AccessDeniedException("You cannot access another location's records");
            }

            return;
        }

        StaffProfile staffProfile = requireCurrentStaffProfile();

        if (staffProfile.getPrimaryLocation() == null) {
            ensureStudioAccess(staffProfile.getStudio().getId());
            return;
        }

        if (!staffProfile.getPrimaryLocation().getId().equals(requestedLocationId) && getCurrentUserRole() == UserRole.STAFF) {
            throw new AccessDeniedException("You cannot access another location's records");
        }
    }

    public void ensureAssignedStaff(StaffProfile staffProfile) {
        if (!staffProfile.getUser().getId().equals(getCurrentUserId())) {
            throw new AccessDeniedException("You can only access appointments assigned to you");
        }
    }

    private StudioFlowUserPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof StudioFlowUserPrincipal principal)) {
            throw new AccessDeniedException("Authentication is required");
        }

        return principal;
    }
}
