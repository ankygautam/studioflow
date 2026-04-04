package com.studioflow.repository;

import com.studioflow.entity.StaffProfile;
import com.studioflow.enums.StaffStatus;
import com.studioflow.enums.UserRole;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, UUID> {

    List<StaffProfile> findByStudioId(UUID studioId);

    List<StaffProfile> findByStudioIdAndPrimaryLocationId(UUID studioId, UUID primaryLocationId);

    @Query(
        """
        select staffProfile
        from StaffProfile staffProfile
        where staffProfile.studio.id = :studioId
          and (
            staffProfile.primaryLocation is null
            or staffProfile.primaryLocation.id = :primaryLocationId
          )
        """
    )
    List<StaffProfile> findVisibleByStudioIdAndLocationId(UUID studioId, UUID primaryLocationId);

    List<StaffProfile> findByStudioIdAndStatus(UUID studioId, StaffStatus status);

    long countByStudioIdAndStatus(UUID studioId, StaffStatus status);

    List<StaffProfile> findByStudioIdAndStatusAndUserRole(UUID studioId, StaffStatus status, UserRole userRole);

    List<StaffProfile> findByStudioIdAndPrimaryLocationIdAndStatusAndUserRole(
        UUID studioId,
        UUID primaryLocationId,
        StaffStatus status,
        UserRole userRole
    );

    Optional<StaffProfile> findByUserId(UUID userId);
}
