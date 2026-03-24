package com.studioflow.service.auth;

import com.studioflow.entity.StaffProfile;
import com.studioflow.enums.UserRole;
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

    private final StaffProfileRepository staffProfileRepository;

    public UUID getCurrentUserId() {
        return requirePrincipal().getId();
    }

    public UserRole getCurrentUserRole() {
        return requirePrincipal().getRole();
    }

    public boolean hasRole(UserRole role) {
        return getCurrentUserRole() == role;
    }

    public void requireAnyRole(UserRole... roles) {
        UserRole currentRole = getCurrentUserRole();

        if (Arrays.stream(roles).noneMatch((role) -> role == currentRole)) {
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

        return staffProfileRepository.findByUserId(getCurrentUserId())
            .orElseThrow(() -> new AccessDeniedException("No studio is assigned to this account"));
    }

    public UUID getCurrentStudioId() {
        return requireCurrentStaffProfile().getStudio().getId();
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
