package com.studioflow.service;

import com.studioflow.dto.staff.CreateStaffRequest;
import com.studioflow.dto.staff.StaffResponse;
import com.studioflow.dto.staff.UpdateStaffRequest;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffManagementService {

    private final StaffProfileRepository staffProfileRepository;
    private final UserRepository userRepository;
    private final StudioRepository studioRepository;

    public StaffResponse create(CreateStaffRequest request) {
        User user = findUser(request.userId());
        Studio studio = findStudio(request.studioId());
        validateInternalUser(user);

        StaffProfile profile = new StaffProfile();
        mapRequest(profile, request, user, studio);

        return toResponse(staffProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getAll(UUID studioId) {
        List<StaffProfile> staffProfiles = studioId == null
            ? staffProfileRepository.findAll()
            : staffProfileRepository.findByStudioId(studioId);

        return staffProfiles.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public StaffResponse getById(UUID id) {
        return toResponse(findStaffProfile(id));
    }

    public StaffResponse update(UUID id, UpdateStaffRequest request) {
        StaffProfile profile = findStaffProfile(id);
        User user = findUser(request.userId());
        Studio studio = findStudio(request.studioId());
        validateInternalUser(user);

        mapRequest(profile, request, user, studio);
        return toResponse(staffProfileRepository.save(profile));
    }

    public void deactivate(UUID id) {
        StaffProfile profile = findStaffProfile(id);
        profile.setStatus(com.studioflow.enums.StaffStatus.INACTIVE);
        staffProfileRepository.save(profile);
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

    private void validateInternalUser(User user) {
        if (user.getRole() == UserRole.CUSTOMER) {
            throw new BadRequestException("Customer users cannot be assigned to staff profiles");
        }
    }

    private void mapRequest(
        StaffProfile profile,
        CreateStaffRequest request,
        User user,
        Studio studio
    ) {
        profile.setUser(user);
        profile.setStudio(studio);
        profile.setDisplayName(request.displayName());
        profile.setJobTitle(request.jobTitle());
        profile.setPhone(request.phone());
        profile.setBio(request.bio());
        profile.setAvatarUrl(request.avatarUrl());
        profile.setStatus(request.status());
    }

    private void mapRequest(
        StaffProfile profile,
        UpdateStaffRequest request,
        User user,
        Studio studio
    ) {
        profile.setUser(user);
        profile.setStudio(studio);
        profile.setDisplayName(request.displayName());
        profile.setJobTitle(request.jobTitle());
        profile.setPhone(request.phone());
        profile.setBio(request.bio());
        profile.setAvatarUrl(request.avatarUrl());
        profile.setStatus(request.status());
    }

    private StaffResponse toResponse(StaffProfile profile) {
        return new StaffResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getUser().getFullName(),
            profile.getStudio().getId(),
            profile.getStudio().getName(),
            profile.getDisplayName(),
            profile.getJobTitle(),
            profile.getPhone(),
            profile.getBio(),
            profile.getAvatarUrl(),
            profile.getStatus(),
            profile.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
