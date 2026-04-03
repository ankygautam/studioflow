package com.studioflow.service.appointment;

import com.studioflow.dto.appointment.AppointmentSuggestionItem;
import com.studioflow.dto.appointment.AppointmentSuggestionsResponse;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.Availability;
import com.studioflow.entity.Location;
import com.studioflow.entity.Service;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.StaffStatus;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.AvailabilityRepository;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentSuggestionService {

    private static final int SLOT_INTERVAL_MINUTES = 15;
    private static final int MAX_SUGGESTIONS = 6;
    private static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    private static final LocalTime DEFAULT_END = LocalTime.of(17, 0);
    private static final DateTimeFormatter SLOT_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    private final CurrentUserService currentUserService;
    private final StudioRepository studioRepository;
    private final LocationRepository locationRepository;
    private final ServiceRepository serviceRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;

    public AppointmentSuggestionsResponse getSuggestions(
        UUID studioId,
        UUID locationId,
        UUID serviceId,
        UUID staffProfileId,
        LocalDate date,
        UUID appointmentId
    ) {
        currentUserService.requireAnyRole(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.STAFF);

        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        currentUserService.ensureLocationAccess(locationId);

        if (date.isBefore(LocalDate.now())) {
            return new AppointmentSuggestionsResponse(
                authorizedStudioId,
                locationId,
                serviceId,
                staffProfileId,
                date,
                List.of()
            );
        }

        Studio studio = findStudio(authorizedStudioId);
        Location location = findLocation(locationId);
        Service service = findService(serviceId);
        StaffProfile staffProfile = findStaffProfile(staffProfileId);
        Appointment ignoredAppointment = findIgnoredAppointment(appointmentId);

        validateSchedulingScope(studio, location, service, staffProfile);

        if (currentUserService.hasRole(UserRole.STAFF)) {
            currentUserService.ensureAssignedStaff(staffProfile);
            if (ignoredAppointment != null) {
                currentUserService.ensureAssignedStaff(ignoredAppointment.getStaffProfile());
            }
        }

        List<TimeBlock> availabilityBlocks = availabilityRepository.findByStaffProfileIdAndDayOfWeekAndIsAvailableTrue(
            staffProfile.getId(),
            date.getDayOfWeek().getValue()
        )
            .stream()
            .map(availability -> new TimeBlock(availability.getStartTime(), availability.getEndTime()))
            .toList();

        List<TimeBlock> blocks = availabilityBlocks.isEmpty()
            ? List.of(new TimeBlock(DEFAULT_START, DEFAULT_END))
            : availabilityBlocks;

        List<Appointment> existingAppointments = appointmentRepository.findByStaffProfileIdAndLocationIdAndAppointmentDate(
            staffProfile.getId(),
            location.getId(),
            date
        )
            .stream()
            .filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED)
            .filter(appointment -> ignoredAppointment == null || !appointment.getId().equals(ignoredAppointment.getId()))
            .sorted(Comparator.comparing(Appointment::getStartTime))
            .toList();

        List<AppointmentSuggestionItem> suggestions = blocks.stream()
            .flatMap(block -> block.toSlots(service.getDurationMinutes()).stream()
                .filter(slot -> existingAppointments.stream().noneMatch(existing -> overlaps(slot, existing)))
                .filter(slot -> !matchesIgnoredAppointment(slot, ignoredAppointment, date, staffProfile, location))
                .map(slot -> scoreSlot(block, slot, existingAppointments))
            )
            .sorted(Comparator
                .comparingInt(ScoredSlot::score).reversed()
                .thenComparing(ScoredSlot::idleMinutes)
                .thenComparing(scoredSlot -> scoredSlot.slot().startTime()))
            .limit(MAX_SUGGESTIONS)
            .map(ScoredSlot::toResponse)
            .toList();

        return new AppointmentSuggestionsResponse(
            studio.getId(),
            location.getId(),
            service.getId(),
            staffProfile.getId(),
            date,
            suggestions
        );
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private Location findLocation(UUID id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
    }

    private Service findService(UUID id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private StaffProfile findStaffProfile(UUID id) {
        return staffProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found: " + id));
    }

    private Appointment findIgnoredAppointment(UUID id) {
        if (id == null) {
            return null;
        }

        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        currentUserService.ensureStudioAccess(appointment.getStudio().getId());
        return appointment;
    }

    private void validateSchedulingScope(Studio studio, Location location, Service service, StaffProfile staffProfile) {
        UUID studioId = studio.getId();

        if (!location.getStudio().getId().equals(studioId)) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot access another location's records");
        }

        if (!service.getStudio().getId().equals(studioId)) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot access another service's records");
        }

        if (!staffProfile.getStudio().getId().equals(studioId) || staffProfile.getStatus() != StaffStatus.ACTIVE) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot access another staff member's records");
        }

        if (staffProfile.getPrimaryLocation() != null && !staffProfile.getPrimaryLocation().getId().equals(location.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("The selected staff member is not assigned to this location");
        }
    }

    private boolean overlaps(CandidateSlot slot, Appointment appointment) {
        return slot.startTime().isBefore(appointment.getEndTime())
            && slot.endTime().isAfter(appointment.getStartTime());
    }

    private boolean matchesIgnoredAppointment(
        CandidateSlot slot,
        Appointment ignoredAppointment,
        LocalDate date,
        StaffProfile staffProfile,
        Location location
    ) {
        if (ignoredAppointment == null) {
            return false;
        }

        return ignoredAppointment.getAppointmentDate().equals(date)
            && ignoredAppointment.getStaffProfile().getId().equals(staffProfile.getId())
            && ignoredAppointment.getLocation().getId().equals(location.getId())
            && ignoredAppointment.getStartTime().equals(slot.startTime())
            && ignoredAppointment.getEndTime().equals(slot.endTime());
    }

    private ScoredSlot scoreSlot(TimeBlock block, CandidateSlot slot, List<Appointment> existingAppointments) {
        Appointment previousAppointment = existingAppointments.stream()
            .filter(appointment -> !appointment.getEndTime().isAfter(slot.startTime()))
            .max(Comparator.comparing(Appointment::getEndTime))
            .orElse(null);
        Appointment nextAppointment = existingAppointments.stream()
            .filter(appointment -> !appointment.getStartTime().isBefore(slot.endTime()))
            .min(Comparator.comparing(Appointment::getStartTime))
            .orElse(null);

        LocalTime previousBoundary = previousAppointment != null ? previousAppointment.getEndTime() : block.start();
        LocalTime nextBoundary = nextAppointment != null ? nextAppointment.getStartTime() : block.end();

        long idleBefore = Duration.between(previousBoundary, slot.startTime()).toMinutes();
        long idleAfter = Duration.between(slot.endTime(), nextBoundary).toMinutes();
        long totalIdle = Math.max(0, idleBefore) + Math.max(0, idleAfter);

        int score;
        String reason;

        if (previousAppointment != null && nextAppointment != null && idleBefore == 0 && idleAfter == 0) {
            score = 400;
            reason = "Perfect fit between nearby appointments";
        } else if (previousAppointment != null && idleBefore == 0) {
            score = 320 - (int) Math.min(idleAfter, 120);
            reason = "Starts right after another booking";
        } else if (nextAppointment != null && idleAfter == 0) {
            score = 310 - (int) Math.min(idleBefore, 120);
            reason = "Ends right before another booking";
        } else if (previousAppointment != null || nextAppointment != null) {
            score = 220 - (int) Math.min(totalIdle, 180);
            reason = "Helps reduce open gaps in the day";
        } else {
            score = 100;
            reason = "Open slot within staff availability";
        }

        return new ScoredSlot(slot, score, totalIdle, reason);
    }

    private record TimeBlock(LocalTime start, LocalTime end) {

        private List<CandidateSlot> toSlots(int durationMinutes) {
            java.util.ArrayList<CandidateSlot> slots = new java.util.ArrayList<>();
            LocalTime current = start;

            while (!current.plusMinutes(durationMinutes).isAfter(end)) {
                LocalTime slotEnd = current.plusMinutes(durationMinutes);
                slots.add(new CandidateSlot(current, slotEnd));
                current = current.plusMinutes(SLOT_INTERVAL_MINUTES);
            }

            return slots;
        }
    }

    private record CandidateSlot(LocalTime startTime, LocalTime endTime) {
    }

    private record ScoredSlot(CandidateSlot slot, int score, long idleMinutes, String reason) {

        private AppointmentSuggestionItem toResponse() {
            return new AppointmentSuggestionItem(
                slot.startTime(),
                slot.endTime(),
                slot.startTime().format(SLOT_FORMATTER) + " - " + slot.endTime().format(SLOT_FORMATTER),
                reason
            );
        }
    }
}
