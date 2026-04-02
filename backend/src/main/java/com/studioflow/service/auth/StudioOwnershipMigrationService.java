package com.studioflow.service.auth;

import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.UserRole;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudioOwnershipMigrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(StudioOwnershipMigrationService.class);

    private final StudioRepository studioRepository;
    private final StaffProfileRepository staffProfileRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void backfillStudioOwners() {
        List<Studio> studiosNeedingOwner = studioRepository.findAll().stream()
            .filter((studio) -> studio.getOwnerUser() == null)
            .toList();

        if (studiosNeedingOwner.isEmpty()) {
            return;
        }

        int updatedCount = 0;

        for (Studio studio : studiosNeedingOwner) {
            User inferredOwner = inferOwnerFromLegacyStudioMappings(studio);
            if (inferredOwner == null) {
                LOGGER.warn("Unable to infer owner for legacy studio. studioId={} studioName={}", studio.getId(), studio.getName());
                continue;
            }

            studio.setOwnerUser(inferredOwner);
            updatedCount++;
            LOGGER.info(
                "Backfilled studio owner from legacy staff profile mapping. studioId={} ownerUserId={} role={}",
                studio.getId(),
                inferredOwner.getId(),
                inferredOwner.getRole()
            );
        }

        if (updatedCount > 0) {
            studioRepository.flush();
            LOGGER.info("Studio ownership backfill completed. updatedStudios={}", updatedCount);
        }
    }

    private User inferOwnerFromLegacyStudioMappings(Studio studio) {
        return staffProfileRepository.findByStudioId(studio.getId()).stream()
            .map(StaffProfile::getUser)
            .filter((user) -> user != null && (user.getRole() == UserRole.OWNER || user.getRole() == UserRole.ADMIN))
            .sorted(Comparator.comparing(User::getCreatedAt))
            .findFirst()
            .orElse(null);
    }
}
