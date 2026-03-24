package com.studioflow.repository;

import com.studioflow.entity.Appointment;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    boolean existsByBookingReferenceIgnoreCase(String bookingReference);

    Optional<Appointment> findByStudioIdAndBookingReferenceIgnoreCase(UUID studioId, String bookingReference);

    List<Appointment> findByStudioId(UUID studioId);

    List<Appointment> findByStudioIdAndLocationId(UUID studioId, UUID locationId);

    List<Appointment> findByStudioIdAndStaffProfileUserId(UUID studioId, UUID userId);

    List<Appointment> findByStudioIdAndLocationIdAndStaffProfileUserId(UUID studioId, UUID locationId, UUID userId);

    List<Appointment> findByStaffProfileIdAndAppointmentDate(UUID staffProfileId, LocalDate appointmentDate);

    List<Appointment> findByStaffProfileIdAndLocationIdAndAppointmentDate(UUID staffProfileId, UUID locationId, LocalDate appointmentDate);

    List<Appointment> findByAppointmentDateBetween(LocalDate from, LocalDate to);
}
