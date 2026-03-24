package com.studioflow.repository;

import com.studioflow.entity.CustomerProfile;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {

    List<CustomerProfile> findByStudioId(UUID studioId);
}
