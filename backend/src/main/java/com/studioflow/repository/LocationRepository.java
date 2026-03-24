package com.studioflow.repository;

import com.studioflow.entity.Location;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, UUID> {

    List<Location> findByStudioIdOrderByNameAsc(UUID studioId);

    List<Location> findByStudioIdAndIsActiveTrueOrderByNameAsc(UUID studioId);

    Optional<Location> findByStudioIdAndSlugIgnoreCase(UUID studioId, String slug);

    boolean existsBySlugIgnoreCase(String slug);
}
