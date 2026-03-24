package com.studioflow.repository;

import com.studioflow.entity.StaffService;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffServiceRepository extends JpaRepository<StaffService, UUID> {

    List<StaffService> findByServiceId(UUID serviceId);
}
