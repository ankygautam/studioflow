package com.studioflow.service;

import com.studioflow.dto.appointment.AppointmentCreateRequest;
import com.studioflow.dto.appointment.AppointmentResponse;
import com.studioflow.dto.appointment.AppointmentUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CommunicationLog;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Location;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.CommunicationDeliveryStatus;
import com.studioflow.enums.CommunicationEventType;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.CommunicationLogRepository;
import com.studioflow.repository.ConsentFormSubmissionRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.NotificationRepository;
import com.studioflow.repository.PaymentRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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
    private final LocationRepository locationRepository;
    private final CommunicationLogRepository communicationLogRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final ConsentFormSubmissionRepository consentFormSubmissionRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        validateTimeRange(request.startTime(), request.endTime());

        UUID studioId = currentUserService.requireStudioAccess(request.studioId());
        Studio studio = findStudio(studioId);
        Location location = findLocation(request.locationId());
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());
        validateStudioRelationships(studio, location, customerProfile, staffProfile, service);

        Appointment appointment = new Appointment();
        mapRequest(appointment, request, studio, location, customerProfile, staffProfile, service);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentCreated(savedAppointment);
        auditLogService.log(
            AuditEntityType.APPOINTMENT,
            savedAppointment.getId(),
            AuditActionType.CREATED,
            savedAppointment.getStudio().getId(),
            savedAppointment.getLocation().getId(),
            "Appointment created",
            "A booking was created for " + savedAppointment.getCustomerProfile().getFullName() + "."
        );
        return toResponse(savedAppointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments(UUID studioId, UUID locationId) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        UUID authorizedLocationId = locationId != null ? currentUserService.requireLocationAccess(locationId) : null;
        List<Appointment> appointments = currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)
            ? getStaffScopedAppointments(authorizedStudioId, authorizedLocationId)
            : getStudioAppointments(authorizedStudioId, authorizedLocationId);

        return appointments.stream()
            .sorted(Comparator
                .comparing(Appointment::getAppointmentDate)
                .thenComparing(Appointment::getStartTime))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            currentUserService.ensureAssignedStaff(appointment.getStaffProfile());
        }
        return toResponse(appointment);
    }

    public AppointmentResponse updateAppointment(UUID id, AppointmentUpdateRequest request) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        validateTimeRange(request.startTime(), request.endTime());

        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        LocalDate previousDate = appointment.getAppointmentDate();
        LocalTime previousStartTime = appointment.getStartTime();
        LocalTime previousEndTime = appointment.getEndTime();
        com.studioflow.enums.AppointmentStatus previousStatus = appointment.getStatus();
        UUID previousStaffId = appointment.getStaffProfile().getId();

        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            ensureStaffCanUpdateAppointment(appointment, request);
        }

        UUID studioId = currentUserService.requireStudioAccess(request.studioId());
        Studio studio = findStudio(studioId);
        Location location = findLocation(request.locationId());
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());
        validateStudioRelationships(studio, location, customerProfile, staffProfile, service);

        mapRequest(appointment, request, studio, location, customerProfile, staffProfile, service);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentUpdated(savedAppointment, previousDate, previousStartTime, previousStatus);
        auditLogService.log(
            AuditEntityType.APPOINTMENT,
            savedAppointment.getId(),
            resolveAppointmentAction(previousStatus, savedAppointment, previousDate, previousStartTime, previousEndTime, previousStaffId),
            savedAppointment.getStudio().getId(),
            savedAppointment.getLocation().getId(),
            resolveAppointmentTitle(previousStatus, savedAppointment, previousDate, previousStartTime, previousEndTime, previousStaffId),
            resolveAppointmentDescription(savedAppointment, previousDate, previousStartTime, previousEndTime, previousStatus, previousStaffId),
            buildAppointmentMetadata(savedAppointment, previousDate, previousStartTime, previousEndTime, previousStatus, previousStaffId)
        );
        return toResponse(savedAppointment);
    }

    public void deleteAppointment(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        consentFormSubmissionRepository.deleteByAppointmentId(appointment.getId());
        notificationRepository.deleteByAppointmentId(appointment.getId());
        communicationLogRepository.deleteByAppointmentId(appointment.getId());
        paymentRepository.deleteByAppointmentId(appointment.getId());
        appointmentRepository.delete(appointment);
        auditLogService.log(
            AuditEntityType.APPOINTMENT,
            appointment.getId(),
            AuditActionType.DELETED,
            appointment.getStudio().getId(),
            appointment.getLocation().getId(),
            "Appointment deleted",
            "A booking for " + appointment.getCustomerProfile().getFullName() + " was deleted."
        );
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

    private Location findLocation(UUID id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
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
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        UUID studioId = studio.getId();

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

    private void mapRequest(
        Appointment appointment,
        AppointmentCreateRequest request,
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        appointment.setStudio(studio);
        appointment.setLocation(location);
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
        Location location,
        CustomerProfile customerProfile,
        StaffProfile staffProfile,
        com.studioflow.entity.Service service
    ) {
        appointment.setStudio(studio);
        appointment.setLocation(location);
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

    private void ensureStaffCanUpdateAppointment(Appointment appointment, AppointmentUpdateRequest request) {
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

    private AppointmentResponse toResponse(Appointment appointment) {
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
            latestSentAt(appointment, CommunicationEventType.BOOKING_CONFIRMED),
            latestSentAt(appointment, CommunicationEventType.APPOINTMENT_REMINDER)
        );
    }

    private List<Appointment> getStudioAppointments(UUID studioId, UUID locationId) {
        return locationId != null
            ? appointmentRepository.findByStudioIdAndLocationId(studioId, locationId)
            : appointmentRepository.findByStudioId(studioId);
    }

    private List<Appointment> getStaffScopedAppointments(UUID studioId, UUID locationId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        return locationId != null
            ? appointmentRepository.findByStudioIdAndLocationIdAndStaffProfileUserId(studioId, locationId, currentUserId)
            : appointmentRepository.findByStudioIdAndStaffProfileUserId(studioId, currentUserId);
    }

    private java.time.Instant latestSentAt(Appointment appointment, CommunicationEventType eventType) {
        return communicationLogRepository
            .findTopByAppointmentIdAndEventTypeAndDeliveryStatusOrderBySentAtDesc(
                appointment.getId(),
                eventType,
                CommunicationDeliveryStatus.SENT
            )
            .map(CommunicationLog::getSentAt)
            .orElse(null);
    }

    private AuditActionType resolveAppointmentAction(
        com.studioflow.enums.AppointmentStatus previousStatus,
        Appointment appointment,
        java.time.LocalDate previousDate,
        java.time.LocalTime previousStartTime,
        java.time.LocalTime previousEndTime,
        UUID previousStaffId
    ) {
        if (previousStatus != appointment.getStatus() && appointment.getStatus() == com.studioflow.enums.AppointmentStatus.CANCELLED) {
            return AuditActionType.CANCELLED;
        }

        if (
            !previousDate.equals(appointment.getAppointmentDate())
                || !previousStartTime.equals(appointment.getStartTime())
                || !previousEndTime.equals(appointment.getEndTime())
        ) {
            return AuditActionType.RESCHEDULED;
        }

        if (previousStatus != appointment.getStatus()) {
            return AuditActionType.STATUS_CHANGED;
        }

        if (!previousStaffId.equals(appointment.getStaffProfile().getId())) {
            return AuditActionType.ASSIGNED;
        }

        return AuditActionType.UPDATED;
    }

    private String resolveAppointmentTitle(
        com.studioflow.enums.AppointmentStatus previousStatus,
        Appointment appointment,
        java.time.LocalDate previousDate,
        java.time.LocalTime previousStartTime,
        java.time.LocalTime previousEndTime,
        UUID previousStaffId
    ) {
        return switch (resolveAppointmentAction(
            previousStatus,
            appointment,
            previousDate,
            previousStartTime,
            previousEndTime,
            previousStaffId
        )) {
            case RESCHEDULED -> "Appointment rescheduled";
            case CANCELLED -> "Appointment cancelled";
            case STATUS_CHANGED -> "Appointment status changed";
            case ASSIGNED -> "Appointment reassigned";
            default -> "Appointment updated";
        };
    }

    private String resolveAppointmentDescription(
        Appointment appointment,
        LocalDate previousDate,
        LocalTime previousStartTime,
        LocalTime previousEndTime,
        com.studioflow.enums.AppointmentStatus previousStatus,
        UUID previousStaffId
    ) {
        return switch (resolveAppointmentAction(
            previousStatus,
            appointment,
            previousDate,
            previousStartTime,
            previousEndTime,
            previousStaffId
        )) {
            case RESCHEDULED -> "The booking for " + appointment.getCustomerProfile().getFullName() + " was rescheduled.";
            case CANCELLED -> "The booking for " + appointment.getCustomerProfile().getFullName() + " was cancelled.";
            case STATUS_CHANGED -> "The booking status changed to " + appointment.getStatus() + ".";
            case ASSIGNED -> "The booking was reassigned to " + appointment.getStaffProfile().getDisplayName() + ".";
            default -> "The booking for " + appointment.getCustomerProfile().getFullName() + " was updated.";
        };
    }

    private Map<String, Object> buildAppointmentMetadata(
        Appointment appointment,
        LocalDate previousDate,
        LocalTime previousStartTime,
        LocalTime previousEndTime,
        com.studioflow.enums.AppointmentStatus previousStatus,
        UUID previousStaffId
    ) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("previousStatus", previousStatus.name());
        metadata.put("newStatus", appointment.getStatus().name());
        metadata.put("previousDate", previousDate.toString());
        metadata.put("newDate", appointment.getAppointmentDate().toString());
        metadata.put("previousStartTime", previousStartTime.toString());
        metadata.put("newStartTime", appointment.getStartTime().toString());
        metadata.put("previousEndTime", previousEndTime.toString());
        metadata.put("newEndTime", appointment.getEndTime().toString());
        metadata.put("previousStaffId", previousStaffId.toString());
        metadata.put("newStaffId", appointment.getStaffProfile().getId().toString());
        return metadata;
    }
}
