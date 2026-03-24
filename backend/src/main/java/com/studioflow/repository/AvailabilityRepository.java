package com.studioflow.repository;

import com.studioflow.entity.Availability;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {

    List<Availability> findByStaffProfileIdAndDayOfWeekAndIsAvailableTrue(UUID staffProfileId, Integer dayOfWeek);
}
