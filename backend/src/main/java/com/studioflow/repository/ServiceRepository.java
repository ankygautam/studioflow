package com.studioflow.repository;

import com.studioflow.entity.Service;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, UUID> {

    List<Service> findByStudioId(UUID studioId);
}
