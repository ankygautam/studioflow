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
import com.studioflow.service.appointment.AppointmentMapper;
import com.studioflow.service.appointment.AppointmentPolicyService;
import com.studioflow.service.auth.CurrentUserService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
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
    private final AppointmentPolicyService appointmentPolicyService;
    private final AppointmentMapper appointmentMapper;

    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        appointmentPolicyService.validateTimeRange(request.startTime(), request.endTime());

        UUID studioId = currentUserService.requireStudioAccess(request.studioId());
        Studio studio = findStudio(studioId);
        Location location = findLocation(request.locationId());
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());

        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            appointmentPolicyService.ensureStaffCanCreateAppointment(staffProfile);
        }

        appointmentPolicyService.validateStudioRelationships(studio, location, customerProfile, staffProfile, service);
        appointmentPolicyService.validateStaffAvailability(staffProfile, request.appointmentDate(), request.startTime(), request.endTime());

        Appointment appointment = new Appointment();
        appointmentMapper.applyCreateRequest(appointment, request, studio, location, customerProfile, staffProfile, service);
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
        appointmentPolicyService.validateTimeRange(request.startTime(), request.endTime());

        Appointment appointment = findAppointment(id);
        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        LocalDate previousDate = appointment.getAppointmentDate();
        LocalTime previousStartTime = appointment.getStartTime();
        LocalTime previousEndTime = appointment.getEndTime();
        com.studioflow.enums.AppointmentStatus previousStatus = appointment.getStatus();
        UUID previousCustomerId = appointment.getCustomerProfile().getId();
        UUID previousLocationId = appointment.getLocation().getId();
        UUID previousStaffId = appointment.getStaffProfile().getId();
        UUID previousServiceId = appointment.getService().getId();

        if (currentUserService.hasRole(com.studioflow.enums.UserRole.STAFF)) {
            appointmentPolicyService.ensureStaffCanUpdateAppointment(appointment, request);
        }

        UUID studioId = currentUserService.requireStudioAccess(request.studioId());
        Studio studio = findStudio(studioId);
        Location location = findLocation(request.locationId());
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        com.studioflow.entity.Service service = findService(request.serviceId());
        appointmentPolicyService.validateStudioRelationships(studio, location, customerProfile, staffProfile, service);
        appointmentPolicyService.validateStaffAvailability(staffProfile, request.appointmentDate(), request.startTime(), request.endTime());

        appointmentMapper.applyUpdateRequest(appointment, request, studio, location, customerProfile, staffProfile, service);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        notificationService.notifyAppointmentUpdated(
            savedAppointment,
            previousDate,
            previousStartTime,
            previousEndTime,
            previousStatus,
            previousCustomerId,
            previousLocationId,
            previousStaffId,
            previousServiceId
        );
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

    private AppointmentResponse toResponse(Appointment appointment) {
        return appointmentMapper.toResponse(
            appointment,
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
