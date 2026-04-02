package com.studioflow.service.appointment;

import com.studioflow.dto.appointment.AppointmentCreateRequest;
import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.appointment.AppointmentUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Location;
import com.studioflow.entity.Service;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import java.time.Instant;

@org.springframework.stereotype.Component
public class AppointmentMapper {

    public void applyCreateRequest(
        Appointment appointment,
        AppointmentCreateRequest request,
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        Service service
    ) {
        applyCommonFields(appointment, studio, location, customerProfile, staffProfile, service);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setStatus(request.status());
        appointment.setNotes(request.notes());
        appointment.setSource(request.source());
    }

    public void applyUpdateRequest(
        Appointment appointment,
        AppointmentUpdateRequest request,
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        Service service
    ) {
        applyCommonFields(appointment, studio, location, customerProfile, staffProfile, service);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setStatus(request.status());
        appointment.setNotes(request.notes());
        appointment.setSource(request.source());
    }

    public AppointmentResponse toResponse(
        Appointment appointment,
        Instant bookingConfirmationSentAt,
        Instant reminderSentAt
    ) {
        return new AppointmentResponse(
            appointment.getId(),
            appointment.getStudio().getId(),
            appointment.getLocation().getId(),
            appointment.getCustomerProfile().getId(),
            appointment.getStaffProfile().getId(),
            appointment.getService().getId(),
            appointment.getAppointmentDate(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getStatus(),
            appointment.getNotes(),
            appointment.getSource(),
            appointment.getCreatedAt(),
            appointment.getUpdatedAt(),
            appointment.getCustomerProfile().getFullName(),
            appointment.getStaffProfile().getDisplayName(),
            appointment.getService().getName(),
            appointment.getLocation().getName(),
            bookingConfirmationSentAt,
            reminderSentAt
        );
    }

    private void applyCommonFields(
        Appointment appointment,
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        Service service
    ) {
        appointment.setStudio(studio);
        appointment.setLocation(location);
        appointment.setCustomerProfile(customerProfile);
        appointment.setStaffProfile(staffProfile);
        appointment.setService(service);
    }
}
