package com.studioflow.service;

import com.studioflow.dto.waitlist.WaitlistEntryCreateRequest;
import com.studioflow.dto.waitlist.WaitlistEntryResponse;
import com.studioflow.dto.waitlist.WaitlistEntryUpdateRequest;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Location;
import com.studioflow.entity.Service;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.WaitlistEntry;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.repository.WaitlistEntryRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class WaitlistService {

    private final CurrentUserService currentUserService;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final StudioRepository studioRepository;
    private final LocationRepository locationRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final ServiceRepository serviceRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final AuditLogService auditLogService;

    public WaitlistEntryResponse createEntry(WaitlistEntryCreateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location location = findLocation(request.locationId());
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        Service service = findService(request.serviceId());
        StaffProfile preferredStaffProfile = findPreferredStaff(request.preferredStaffProfileId());

        validateRelationships(studio, location, customerProfile, service, preferredStaffProfile);

        WaitlistEntry entry = new WaitlistEntry();
        mapRequest(
            entry,
            studio,
            location,
            customerProfile,
            service,
            preferredStaffProfile,
            request.preferredDate(),
            request.preferredStartTime(),
            request.preferredEndTime(),
            request.notes(),
            request.isActive() != null ? request.isActive() : Boolean.TRUE
        );

        WaitlistEntry savedEntry = waitlistEntryRepository.save(entry);
        auditLogService.log(
            AuditEntityType.WAITLIST_ENTRY,
            savedEntry.getId(),
            AuditActionType.CREATED,
            savedEntry.getStudio().getId(),
            savedEntry.getLocation().getId(),
            "Waitlist entry created",
            savedEntry.getCustomerProfile().getFullName() + " was added to the waitlist."
        );
        return toResponse(savedEntry);
    }

    @Transactional(readOnly = true)
    public List<WaitlistEntryResponse> getEntries(UUID studioId, UUID locationId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        UUID authorizedLocationId = locationId != null ? currentUserService.requireLocationAccess(locationId) : null;

        List<WaitlistEntry> entries = authorizedLocationId != null
            ? waitlistEntryRepository.findByStudioIdAndLocationIdOrderByCreatedAtDesc(authorizedStudioId, authorizedLocationId)
            : waitlistEntryRepository.findByStudioIdOrderByCreatedAtDesc(authorizedStudioId);

        return entries.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<WaitlistEntryResponse> getCancellationMatchSuggestions(UUID appointmentId) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);

        Appointment appointment = appointmentRepository.findDetailedById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        validateCancelledAppointment(appointment);

        List<WaitlistEntry> candidates = waitlistEntryRepository
            .findByStudioIdAndLocationIdAndServiceIdAndIsActiveTrueOrderByCreatedAtAsc(
                appointment.getStudio().getId(),
                appointment.getLocation().getId(),
                appointment.getService().getId()
            );

        return candidates.stream()
            .filter((entry) -> matchesCancelledAppointmentSuggestion(entry, appointment))
            .sorted(Comparator
                .comparingInt((WaitlistEntry entry) -> matchSpecificityScore(entry))
                .thenComparing(WaitlistEntry::getCreatedAt))
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public WaitlistEntryResponse getEntryById(UUID id) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);
        WaitlistEntry entry = findEntry(id);
        currentUserService.ensureStudioAccess(entry.getStudio().getId());
        return toResponse(entry);
    }

    public WaitlistEntryResponse updateEntry(UUID id, WaitlistEntryUpdateRequest request) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST);
        WaitlistEntry entry = findEntry(id);
        currentUserService.ensureStudioAccess(entry.getStudio().getId());

        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location location = findLocation(request.locationId());
        CustomerProfile customerProfile = findCustomerProfile(request.customerProfileId());
        Service service = findService(request.serviceId());
        StaffProfile preferredStaffProfile = findPreferredStaff(request.preferredStaffProfileId());

        validateRelationships(studio, location, customerProfile, service, preferredStaffProfile);

        mapRequest(
            entry,
            studio,
            location,
            customerProfile,
            service,
            preferredStaffProfile,
            request.preferredDate(),
            request.preferredStartTime(),
            request.preferredEndTime(),
            request.notes(),
            request.isActive() != null ? request.isActive() : entry.getIsActive()
        );

        WaitlistEntry savedEntry = waitlistEntryRepository.save(entry);
        auditLogService.log(
            AuditEntityType.WAITLIST_ENTRY,
            savedEntry.getId(),
            AuditActionType.UPDATED,
            savedEntry.getStudio().getId(),
            savedEntry.getLocation().getId(),
            "Waitlist entry updated",
            savedEntry.getCustomerProfile().getFullName() + "'s waitlist details were updated."
        );
        return toResponse(savedEntry);
    }

    public void deleteEntry(UUID id) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST);
        WaitlistEntry entry = findEntry(id);
        currentUserService.ensureStudioAccess(entry.getStudio().getId());
        entry.setIsActive(false);
        waitlistEntryRepository.save(entry);
        auditLogService.log(
            AuditEntityType.WAITLIST_ENTRY,
            entry.getId(),
            AuditActionType.DEACTIVATED,
            entry.getStudio().getId(),
            entry.getLocation().getId(),
            "Waitlist entry deactivated",
            entry.getCustomerProfile().getFullName() + "'s waitlist entry was deactivated."
        );
    }

    private WaitlistEntry findEntry(UUID id) {
        return waitlistEntryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found: " + id));
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private Location findLocation(UUID id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
    }

    private CustomerProfile findCustomerProfile(UUID id) {
        return customerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    private Service findService(UUID id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private StaffProfile findPreferredStaff(UUID id) {
        if (id == null) {
            return null;
        }

        return staffProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found: " + id));
    }

    private void validateRelationships(
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        Service service,
        StaffProfile preferredStaffProfile
    ) {
        if (!location.getStudio().getId().equals(studio.getId())
            || !customerProfile.getStudio().getId().equals(studio.getId())
            || !service.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("Waitlist records must stay within the same studio");
        }

        if (preferredStaffProfile != null && !preferredStaffProfile.getStudio().getId().equals(studio.getId())) {
            throw new BadRequestException("Preferred staff must belong to the same studio");
        }
    }

    private void mapRequest(
        WaitlistEntry entry,
        Studio studio,
        Location location,
        CustomerProfile customerProfile,
        Service service,
        StaffProfile preferredStaffProfile,
        LocalDate preferredDate,
        LocalTime preferredStartTime,
        LocalTime preferredEndTime,
        String notes,
        Boolean isActive
    ) {
        validatePreferredWindow(preferredStartTime, preferredEndTime);
        entry.setStudio(studio);
        entry.setLocation(location);
        entry.setCustomerProfile(customerProfile);
        entry.setService(service);
        entry.setPreferredStaffProfile(preferredStaffProfile);
        entry.setPreferredDate(preferredDate);
        entry.setPreferredStartTime(preferredStartTime);
        entry.setPreferredEndTime(preferredEndTime);
        entry.setNotes(normalize(notes));
        entry.setIsActive(isActive);
    }

    private void validatePreferredWindow(LocalTime preferredStartTime, LocalTime preferredEndTime) {
        if (preferredStartTime != null && preferredEndTime != null && !preferredEndTime.isAfter(preferredStartTime)) {
            throw new BadRequestException("Preferred end time must be after the preferred start time");
        }
    }

    void validateCancelledAppointment(Appointment appointment) {
        if (appointment.getStatus() != AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Waitlist suggestions are only available for cancelled appointments");
        }
    }

    boolean matchesCancelledAppointmentSuggestion(WaitlistEntry entry, Appointment appointment) {
        return matchesPreferredStaff(entry, appointment)
            && matchesPreferredDate(entry, appointment.getAppointmentDate())
            && matchesPreferredTime(entry, appointment.getStartTime(), appointment.getEndTime());
    }

    private boolean matchesPreferredStaff(WaitlistEntry entry, Appointment appointment) {
        return entry.getPreferredStaffProfile() == null
            || entry.getPreferredStaffProfile().getId().equals(appointment.getStaffProfile().getId());
    }

    private boolean matchesPreferredDate(WaitlistEntry entry, LocalDate appointmentDate) {
        return entry.getPreferredDate() == null || entry.getPreferredDate().equals(appointmentDate);
    }

    private boolean matchesPreferredTime(WaitlistEntry entry, LocalTime appointmentStart, LocalTime appointmentEnd) {
        LocalTime requestedStart = entry.getPreferredStartTime() != null ? entry.getPreferredStartTime() : LocalTime.MIN;
        LocalTime requestedEnd = entry.getPreferredEndTime() != null ? entry.getPreferredEndTime() : LocalTime.MAX;
        return requestedStart.isBefore(appointmentEnd) && appointmentStart.isBefore(requestedEnd);
    }

    private int matchSpecificityScore(WaitlistEntry entry) {
        int score = 0;

        if (entry.getPreferredStaffProfile() != null) {
            score -= 4;
        }

        if (entry.getPreferredDate() != null) {
            score -= 3;
        }

        if (entry.getPreferredStartTime() != null) {
            score -= 1;
        }

        if (entry.getPreferredEndTime() != null) {
            score -= 1;
        }

        return score;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private WaitlistEntryResponse toResponse(WaitlistEntry entry) {
        return new WaitlistEntryResponse(
            entry.getId(),
            entry.getStudio().getId(),
            entry.getLocation().getId(),
            entry.getLocation().getName(),
            entry.getCustomerProfile().getId(),
            entry.getCustomerProfile().getFullName(),
            entry.getService().getId(),
            entry.getService().getName(),
            entry.getPreferredStaffProfile() != null ? entry.getPreferredStaffProfile().getId() : null,
            entry.getPreferredStaffProfile() != null ? entry.getPreferredStaffProfile().getDisplayName() : null,
            entry.getPreferredDate(),
            entry.getPreferredStartTime(),
            entry.getPreferredEndTime(),
            entry.getNotes(),
            entry.getIsActive(),
            entry.getCreatedAt(),
            entry.getUpdatedAt()
        );
    }
}
