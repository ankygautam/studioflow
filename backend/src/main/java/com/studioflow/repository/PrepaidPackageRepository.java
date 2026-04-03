package com.studioflow.repository;

import com.studioflow.entity.PrepaidPackage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrepaidPackageRepository extends JpaRepository<PrepaidPackage, UUID> {

    List<PrepaidPackage> findByStudioId(UUID studioId);

    List<PrepaidPackage> findByStudioIdAndIsActiveTrue(UUID studioId);
}
