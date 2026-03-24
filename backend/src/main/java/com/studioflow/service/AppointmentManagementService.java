package com.studioflow.service;

import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.appointment.CreateAppointmentRequest;
import com.studioflow.dto.appointment.UpdateAppointmentRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.enums.StaffStatus;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentManagementService {

    private final AppointmentRepository appointmentRepository;
    private final StudioRepository studioRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final ServiceRepository serviceRepository;

    public AppointmentResponse create(CreateAppointmentRequest request) {
        validateTimeRange(request);

        Studio studio = findStudio(request.studioId());
        CustomerProfile customerProfile = findCustomer(request.customerProfileId());
        StaffProfile staffProfile = findStaff(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());

        validateStudioLinks(studio, customerProfile, staffProfile, service);

        Appointment appointment = new Appointment();
        mapRequest(appointment, request, studio, customerProfile, staffProfile, service);

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAll(UUID studioId) {
        List<Appointment> appointments = studioId == null
            ? appointmentRepository.findAll()
            : appointmentRepository.findByStudioId(studioId);

        return appointments.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(UUID id) {
        return toResponse(findAppointment(id));
    }

    public AppointmentResponse update(UUID id, UpdateAppointmentRequest request) {
        validateTimeRange(request);

        Appointment appointment = findAppointment(id);
        Studio studio = findStudio(request.studioId());
        CustomerProfile customerProfile = findCustomer(request.customerProfileId());
        StaffProfile staffProfile = findStaff(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());

        validateStudioLinks(studio, customerProfile, staffProfile, service);

        mapRequest(appointment, request, studio, customerProfile, staffProfile, service);
        return toResponse(appointmentRepository.save(appointment));
    }

    public void delete(UUID id) {
        Appointment appointment = findAppointment(id);
        appointmentRepository.delete(appointment);
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private CustomerProfile findCustomer(UUID customerId) {
        return customerProfileRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + customerId));
    }

    private StaffProfile findStaff(UUID staffId) {
        return staffProfileRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found: " + staffId));
    }

    private com.studioflow.entity.Service findService(UUID serviceId) {
        return serviceRepository.findById(serviceId)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceId));
    }

    private Appointment findAppointment(UUID id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
    }

    private void validateTimeRange(CreateAppointmentRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BadRequestException("startTime must be earlier than endTime");
        }
    }

    private void validateTimeRange(UpdateAppointmentRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BadRequestException("startTime must be earlier than endTime");
        }
    }

    private void validateStudioLinks(
        Studio studio,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        UUID studioId = studio.getId();

        if (!customerProfile.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("Customer does not belong to the provided studio");
        }

        if (!staffProfile.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("Staff profile does not belong to the provided studio");
        }

        if (!service.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("Service does not belong to the provided studio");
        }

        if (!Boolean.TRUE.equals(customerProfile.getIsActive())) {
            throw new BadRequestException("Inactive clients cannot receive appointments");
        }

        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new BadRequestException("Inactive services cannot be used for appointments");
        }

        if (staffProfile.getStatus() == StaffStatus.INACTIVE) {
            throw new BadRequestException("Inactive staff members cannot be assigned to appointments");
        }
    }

    private void mapRequest(
        Appointment appointment,
        CreateAppointmentRequest request,
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
        UpdateAppointmentRequest request,
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

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
            appointment.getId(),
            appointment.getStudio().getId(),
            appointment.getStudio().getName(),
            appointment.getCustomerProfile().getId(),
            appointment.getCustomerProfile().getFullName(),
            appointment.getStaffProfile().getId(),
            appointment.getStaffProfile().getDisplayName(),
            appointment.getService().getId(),
            appointment.getService().getName(),
            appointment.getAppointmentDate(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getStatus(),
            appointment.getNotes(),
            appointment.getSource(),
            appointment.getCreatedAt(),
            appointment.getUpdatedAt()
        );
    }
}
