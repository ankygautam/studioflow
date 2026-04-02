package com.studioflow.repository;

import com.studioflow.entity.Studio;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudioRepository extends JpaRepository<Studio, UUID> {

    List<Studio> findByIsActiveTrue();

    Optional<Studio> findByOwnerUserId(UUID ownerUserId);
}
