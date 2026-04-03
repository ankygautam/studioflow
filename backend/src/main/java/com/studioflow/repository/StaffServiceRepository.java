package com.studioflow.repository;

import com.studioflow.entity.StaffServiceAssignment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffServiceRepository extends JpaRepository<StaffServiceAssignment, UUID> {

    List<StaffServiceAssignment> findByServiceId(UUID serviceId);
}
