package com.studioflow.repository;

import com.studioflow.entity.Appointment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByStudioId(UUID studioId);
}
