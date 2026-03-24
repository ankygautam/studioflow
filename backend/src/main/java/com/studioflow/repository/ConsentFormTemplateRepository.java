package com.studioflow.repository;

import com.studioflow.entity.ConsentFormTemplate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsentFormTemplateRepository extends JpaRepository<ConsentFormTemplate, UUID> {

    List<ConsentFormTemplate> findByStudioId(UUID studioId);

    List<ConsentFormTemplate> findByStudioIdAndIsActiveTrue(UUID studioId);
}
