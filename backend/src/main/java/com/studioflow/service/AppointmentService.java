package com.studioflow.service;

import com.studioflow.dto.appointment.AppointmentCreateRequest;
import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.appointment.AppointmentUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final CurrentUserService currentUserService;
    private final AppointmentRepository appointmentRepository;
    private final StudioRepository studioRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final ServiceRepository serviceRepository;

    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        validateTimeRange(request.startTime(), request.endTime());

        UUID studioId = currentUserService.requireStudioAccess(request.studioId());
        Studio studio = findStudio(studioId);
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());
        validateStudioRelationships(studio, customerProfile, staffProfile, service);

        Appointment appointment = new Appointment();
        mapRequest(appointment, request, studio, customerProfile, staffProfile, service);
        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments(UUID studioId) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<Appointment> appointments = appointmentRepository.findByStudioId(authorizedStudioId);

        return appointments.stream()
            .sorted(Comparator
                .comparing(Appointment::getAppointmentDate)
                .thenComparing(Appointment::getStartTime))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        return toResponse(appointment);
    }

    public AppointmentResponse updateAppointment(UUID id, AppointmentUpdateRequest request) {
        validateTimeRange(request.startTime(), request.endTime());

        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());

        UUID studioId = currentUserService.requireStudioAccess(request.studioId());
        Studio studio = findStudio(studioId);
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());
        validateStudioRelationships(studio, customerProfile, staffProfile, service);

        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            currentUserService.ensureAssignedStaff(appointment.getStaffProfile());

            if (!staffProfile.getUser().getId().equals(currentUserService.getCurrentUserId())) {
                throw new AccessDeniedException("You cannot reassign appointments to another staff member");
            }
        }

        mapRequest(appointment, request, studio, customerProfile, staffProfile, service);
        return toResponse(appointmentRepository.save(appointment));
    }

    public void deleteAppointment(UUID id) {
        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        appointmentRepository.delete(appointment);
    }

    private Appointment findAppointment(UUID id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private CustomerProfile findCustomerProfile(UUID id) {
        return customerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    private StaffProfile findStaffProfile(UUID id) {
        return staffProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found: " + id));
    }

    private com.studioflow.entity.Service findService(UUID id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private void validateStudioRelationships(
        Studio studio,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        UUID studioId = studio.getId();

        if (!customerProfile.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected client does not belong to your studio");
        }

        if (!staffProfile.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected staff member does not belong to your studio");
        }

        if (!service.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("The selected service does not belong to your studio");
        }
    }

    private void mapRequest(
        Appointment appointment,
        AppointmentCreateRequest request,
        Studio studio,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        appointment.setStudio(studio);
        appointment.setCustomerProfile(customerProfile);
        appointment.setStaffProfile(staffProfile);
        appointment.setService(service);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setStatus(request.status());
        appointment.setNotes(request.notes());
        appointment.setSource(request.source());
    }

    private void mapRequest(
        Appointment appointment,
        AppointmentUpdateRequest request,
        Studio studio,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        appointment.setStudio(studio);
        appointment.setCustomerProfile(customerProfile);
        appointment.setStaffProfile(staffProfile);
        appointment.setService(service);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(request.endTime());
        appointment.setStatus(request.status());
        appointment.setNotes(request.notes());
        appointment.setSource(request.source());
    }

    private void validateTimeRange(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("startTime must be before endTime");
        }
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
            appointment.getId(),
            appointment.getStudio().getId(),
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
            appointment.getService().getName()
        );
    }
}
