package com.studioflow.repository;

import com.studioflow.entity.ClientPackageAssignment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientPackageAssignmentRepository extends JpaRepository<ClientPackageAssignment, UUID> {

    List<ClientPackageAssignment> findByCustomerProfileIdOrderByCreatedAtDesc(UUID customerProfileId);
}
