package com.studioflow.service.appointment;

import com.studioflow.dto.appointment.AppointmentUpdateRequest;
import com.studioflow.entity.Availability;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Location;
import com.studioflow.entity.Service;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.exception.BadRequestException;
import com.studioflow.repository.AvailabilityRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AppointmentPolicyService {

    private static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    private static final LocalTime DEFAULT_END = LocalTime.of(17, 0);

    private final CurrentUserService currentUserService;
    private final AvailabilityRepository availabilityRepository;

    public void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("startTime must be before endTime");
        }
    }

    public void validateStudioRelationships(
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        Service service
    ) {
        var studioId = studio.getId();

        if (!location.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected location does not belong to your studio");
        }

        if (!customerProfile.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected client does not belong to your studio");
        }

        if (!staffProfile.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected staff member does not belong to your studio");
        }

        if (!service.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected service does not belong to your studio");
        }

        if (staffProfile.getPrimaryLocation() != null && !staffProfile.getPrimaryLocation().getId().equals(location.getId())) {
            throw new BadRequestException("The selected staff member is not assigned to this location");
        }
    }

    public void validateStaffAvailability(
        StaffProfile staffProfile,
        LocalDate appointmentDate,
        LocalTime startTime,
        LocalTime endTime
    ) {
        List<Availability> availabilityBlocks = availabilityRepository.findByStaffProfileIdAndDayOfWeekAndIsAvailableTrue(
            staffProfile.getId(),
            appointmentDate.getDayOfWeek().getValue()
        );

        boolean isWithinAvailableWindow = availabilityBlocks.isEmpty()
            ? !startTime.isBefore(DEFAULT_START) && !endTime.isAfter(DEFAULT_END)
            : availabilityBlocks.stream().anyMatch((availability) ->
                !startTime.isBefore(availability.getStartTime()) && !endTime.isAfter(availability.getEndTime())
            );

        if (!isWithinAvailableWindow) {
            throw new BadRequestException("The selected staff member is unavailable during this time.");
        }
    }

    public void ensureStaffCanUpdateAppointment(Appointment appointment, AppointmentUpdateRequest request) {
        currentUserService.ensureAssignedStaff(appointment.getStaffProfile());

        if (!appointment.getStudio().getId().equals(request.studioId())) {
            throw new AccessDeniedException("You cannot move appointments across studios");
        }

        if (!appointment.getLocation().getId().equals(request.locationId())) {
            throw new AccessDeniedException("You cannot change the appointment location");
        }

        if (!appointment.getCustomerProfile().getId().equals(request.customerProfileId())) {
            throw new AccessDeniedException("You cannot reassign the client for this appointment");
        }

        if (!appointment.getService().getId().equals(request.serviceId())) {
            throw new AccessDeniedException("You cannot change the booked service");
        }

        if (!appointment.getStaffProfile().getId().equals(request.staffProfileId())) {
            throw new AccessDeniedException("You cannot reassign appointments to another staff member");
        }

        if (!appointment.getAppointmentDate().equals(request.appointmentDate())) {
            throw new AccessDeniedException("You cannot reschedule appointments");
        }

        if (!appointment.getStartTime().equals(request.startTime()) || !appointment.getEndTime().equals(request.endTime())) {
            throw new AccessDeniedException("You cannot change appointment timing");
        }

        if (appointment.getSource() != request.source()) {
            throw new AccessDeniedException("You cannot change the appointment source");
        }

        if (request.status() == com.studioflow.enums.AppointmentStatus.CANCELLED) {
            throw new AccessDeniedException("You do not have permission to cancel appointments");
        }
    }
}
