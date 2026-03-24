package com.studioflow.service;

import com.studioflow.dto.staff.StaffCreateRequest;
import com.studioflow.dto.staff.StaffResponse;
import com.studioflow.dto.staff.StaffUpdateRequest;
import com.studioflow.entity.Location;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.StaffStatus;
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

    public StaffResponse createStaff(StaffCreateRequest request) {
        User user = findUser(request.userId());
        validateLinkedUser(user, null);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location primaryLocation = findLocation(request.primaryLocationId());
        validateLocation(studio, primaryLocation);

        StaffProfile staffProfile = new StaffProfile();
        mapCreateRequest(staffProfile, request, user, studio, primaryLocation);

        return toResponse(staffProfileRepository.save(staffProfile));
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff(UUID studioId, UUID locationId) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        UUID authorizedLocationId = locationId != null ? currentUserService.requireLocationAccess(locationId) : null;
        List<StaffProfile> staffProfiles = authorizedLocationId != null
            ? staffProfileRepository.findByStudioIdAndPrimaryLocationId(authorizedStudioId, authorizedLocationId)
            : staffProfileRepository.findByStudioId(authorizedStudioId);

        return staffProfiles.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffById(UUID id) {
        StaffProfile staffProfile = findStaffProfile(id);
        currentUserService.ensureStudioAccess(staffProfile.getStudio().getId());
        return toResponse(staffProfile);
    }

    public StaffResponse updateStaff(UUID id, StaffUpdateRequest request) {
        StaffProfile staffProfile = findStaffProfile(id);
        currentUserService.ensureStudioAccess(staffProfile.getStudio().getId());
        User user = findUser(request.userId());
        validateLinkedUser(user, staffProfile.getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location primaryLocation = findLocation(request.primaryLocationId());
        validateLocation(studio, primaryLocation);

        mapUpdateRequest(staffProfile, request, user, studio, primaryLocation);
        return toResponse(staffProfileRepository.save(staffProfile));
    }

    public void deleteStaff(UUID id) {
        StaffProfile staffProfile = findStaffProfile(id);
        currentUserService.ensureStudioAccess(staffProfile.getStudio().getId());
        staffProfile.setStatus(StaffStatus.INACTIVE);
        staffProfileRepository.save(staffProfile);
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
        staffProfile.setJobTitle(request.jobTitle());
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
            staffProfile.getStudio().getName(),
            staffProfile.getPrimaryLocation() != null ? staffProfile.getPrimaryLocation().getName() : null
        );
    }

    private void validateLocation(Studio studio, Location location) {
        if (location != null && !location.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("The selected location does not belong to your studio");
        }
    }
}
