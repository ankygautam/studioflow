package com.studioflow.repository;

import com.studioflow.entity.Studio;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudioRepository extends JpaRepository<Studio, UUID> {
}
