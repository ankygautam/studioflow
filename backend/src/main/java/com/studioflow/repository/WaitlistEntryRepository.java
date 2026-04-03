package com.studioflow.repository;

import com.studioflow.entity.WaitlistEntry;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {

    List<WaitlistEntry> findByStudioIdOrderByCreatedAtDesc(UUID studioId);

    List<WaitlistEntry> findByStudioIdAndLocationIdOrderByCreatedAtDesc(UUID studioId, UUID locationId);

    List<WaitlistEntry> findByStudioIdAndLocationIdAndServiceIdAndIsActiveTrueOrderByCreatedAtAsc(
        UUID studioId,
        UUID locationId,
        UUID serviceId
    );
}
