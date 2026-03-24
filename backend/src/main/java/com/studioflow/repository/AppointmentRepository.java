package com.studioflow.repository;

import com.studioflow.entity.Appointment;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByStudioId(UUID studioId);

    List<Appointment> findByStudioIdAndStaffProfileUserId(UUID studioId, UUID userId);

    List<Appointment> findByStaffProfileIdAndAppointmentDate(UUID staffProfileId, LocalDate appointmentDate);
}
