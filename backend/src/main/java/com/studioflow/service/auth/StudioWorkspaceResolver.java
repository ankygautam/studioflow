package com.studioflow.service.auth;

import com.studioflow.entity.Location;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudioWorkspaceResolver {

    private final LocationRepository locationRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StudioRepository studioRepository;

    public StudioWorkspaceContext resolveForUser(UUID userId) {
        // Owner-first resolution is the primary model.
        // The staff-profile fallback remains only as a compatibility bridge for legacy accounts
        // until all deployed data has been backfilled with studios.owner_user_id.
        Studio studio = studioRepository.findByOwnerUserId(userId)
            .orElseGet(() -> staffProfileRepository.findByUserId(userId).map(StaffProfile::getStudio).orElse(null));

        if (studio == null) {
            return StudioWorkspaceContext.empty();
        }

        UUID locationId = studioRepository.findByOwnerUserId(userId)
            .map((ownedStudio) -> resolvePrimaryLocationId(ownedStudio.getId()))
            .orElseGet(() -> staffProfileRepository.findByUserId(userId)
                .map((staffProfile) -> staffProfile.getPrimaryLocation() != null ? staffProfile.getPrimaryLocation().getId() : null)
                .orElse(resolvePrimaryLocationId(studio.getId())));

        return new StudioWorkspaceContext(
            studio.getId(),
            studio.getName(),
            locationId,
            Boolean.TRUE.equals(studio.getOnboardingCompleted())
        );
    }

    public Optional<Studio> findOwnedStudio(UUID userId) {
        return studioRepository.findByOwnerUserId(userId);
    }

    public UUID resolvePrimaryLocationId(UUID studioId) {
        return locationRepository.findByStudioIdAndIsActiveTrueOrderByNameAsc(studioId).stream()
            .findFirst()
            .map(Location::getId)
            .orElse(null);
    }
}
