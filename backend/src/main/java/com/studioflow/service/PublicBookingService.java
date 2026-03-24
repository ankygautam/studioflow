package com.studioflow.service;

import com.studioflow.dto.booking.PublicBookingAvailabilityResponse;
import com.studioflow.dto.booking.PublicBookingConfirmationResponse;
import com.studioflow.dto.booking.PublicBookingCreateRequest;
import com.studioflow.dto.booking.PublicBookingServiceItem;
import com.studioflow.dto.booking.PublicBookingServicesResponse;
import com.studioflow.dto.booking.PublicBookingStaffItem;
import com.studioflow.dto.booking.PublicBookingStaffResponse;
import com.studioflow.dto.booking.PublicBookingTimeSlot;
import com.studioflow.entity.Appointment;
import com.studioflow.entity.Availability;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Service;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AppointmentSource;
import com.studioflow.enums.AppointmentStatus;
import com.studioflow.enums.StaffStatus;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.AppointmentRepository;
import com.studioflow.repository.AvailabilityRepository;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StaffServiceRepository;
import com.studioflow.repository.StudioRepository;
import jakarta.validation.Valid;
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
@Transactional
public class PublicBookingService {

    private static final LocalTime DEFAULT_START = LocalTime.of(9, 0);
    private static final LocalTime DEFAULT_END = LocalTime.of(17, 0);
    private static final int SLOT_INTERVAL_MINUTES = 30;
    private static final DateTimeFormatter SLOT_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    private final StudioRepository studioRepository;
    private final ServiceRepository serviceRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StaffServiceRepository staffServiceRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @Transactional(readOnly = true)
    public PublicBookingServicesResponse getServices(String studioSlug) {
        Studio studio = resolveStudio(studioSlug);
        List<PublicBookingServiceItem> services = serviceRepository.findByStudioIdAndIsActiveTrue(studio.getId())
            .stream()
            .sorted(Comparator.comparing(Service::getName))
            .map(service -> new PublicBookingServiceItem(
                service.getId(),
                service.getName(),
                service.getCategory(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPrice(),
                service.getDepositRequired(),
                service.getDepositAmount()
            ))
            .toList();

        return new PublicBookingServicesResponse(
            studio.getId(),
            toSlug(studio),
            studio.getName(),
            studio.getTimezone(),
            services
        );
    }

    @Transactional(readOnly = true)
    public PublicBookingStaffResponse getStaff(String studioSlug, UUID serviceId) {
        Studio studio = resolveStudio(studioSlug);
        Service service = findService(serviceId);

        if (!service.getStudio().getId().equals(studio.getId()) || !Boolean.TRUE.equals(service.getIsActive())) {
            throw new ResourceNotFoundException("Service not found for this studio");
        }

        List<UUID> assignedStaffIds = staffServiceRepository.findByServiceId(service.getId())
            .stream()
            .map(staffService -> staffService.getStaffProfile().getId())
            .distinct()
            .toList();

        List<StaffProfile> availableStaff = staffProfileRepository.findByStudioIdAndStatusAndUserRole(
            studio.getId(),
            StaffStatus.ACTIVE,
            UserRole.STAFF
        );

        List<PublicBookingStaffItem> staff = availableStaff
            .stream()
            .filter(staffProfile -> assignedStaffIds.isEmpty() || assignedStaffIds.contains(staffProfile.getId()))
            .sorted(Comparator.comparing(StaffProfile::getDisplayName, String.CASE_INSENSITIVE_ORDER))
            .map(staffProfile -> new PublicBookingStaffItem(
                staffProfile.getId(),
                staffProfile.getDisplayName(),
                staffProfile.getJobTitle(),
                staffProfile.getBio(),
                staffProfile.getAvatarUrl()
            ))
            .toList();

        return new PublicBookingStaffResponse(studio.getId(), toSlug(studio), service.getId(), staff);
    }

    @Transactional(readOnly = true)
    public PublicBookingAvailabilityResponse getAvailability(
        String studioSlug,
        UUID serviceId,
        UUID staffProfileId,
        LocalDate date
    ) {
        if (date.isBefore(LocalDate.now())) {
            Studio studio = resolveStudio(studioSlug);
            return new PublicBookingAvailabilityResponse(
                studio.getId(),
                toSlug(studio),
                serviceId,
                staffProfileId,
                date,
                List.of()
            );
        }

        Studio studio = resolveStudio(studioSlug);
        Service service = findService(serviceId);
        StaffProfile staffProfile = findStaffProfile(staffProfileId);
        ensureSameStudio(studio, service, staffProfile);

        List<PublicBookingTimeSlot> slots = buildSlots(staffProfile, service, date);
        return new PublicBookingAvailabilityResponse(
            studio.getId(),
            toSlug(studio),
            service.getId(),
            staffProfile.getId(),
            date,
            slots
        );
    }

    public PublicBookingConfirmationResponse createBooking(String studioSlug, @Valid PublicBookingCreateRequest request) {
        if (request.appointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Please choose today or a future date");
        }

        Studio studio = resolveStudio(studioSlug);

        if (!studio.getId().equals(request.studioId())) {
            throw new BadRequestException("Booking request does not match the selected studio");
        }

        Service service = findService(request.serviceId());
        StaffProfile staffProfile = findStaffProfile(request.staffProfileId());
        ensureSameStudio(studio, service, staffProfile);

        LocalTime endTime = request.startTime().plusMinutes(service.getDurationMinutes());
        boolean available = buildSlots(staffProfile, service, request.appointmentDate())
            .stream()
            .anyMatch(slot -> slot.startTime().equals(request.startTime()) && slot.endTime().equals(endTime));

        if (!available) {
            throw new BadRequestException("This time slot is no longer available. Please choose another one.");
        }

        CustomerProfile customerProfile = findOrCreateCustomer(studio, request);

        Appointment appointment = new Appointment();
        appointment.setStudio(studio);
        appointment.setCustomerProfile(customerProfile);
        appointment.setStaffProfile(staffProfile);
        appointment.setService(service);
        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(endTime);
        appointment.setStatus(AppointmentStatus.BOOKED);
        appointment.setNotes(normalizeNullable(request.notes()));
        appointment.setSource(AppointmentSource.ONLINE_BOOKING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new PublicBookingConfirmationResponse(
            savedAppointment.getId(),
            studio.getId(),
            toSlug(studio),
            studio.getName(),
            customerProfile.getFullName(),
            customerProfile.getEmail(),
            customerProfile.getPhone(),
            service.getName(),
            staffProfile.getDisplayName(),
            savedAppointment.getAppointmentDate(),
            savedAppointment.getStartTime(),
            savedAppointment.getEndTime(),
            savedAppointment.getStatus(),
            service.getDepositRequired(),
            service.getDepositAmount()
        );
    }

    private List<PublicBookingTimeSlot> buildSlots(StaffProfile staffProfile, Service service, LocalDate date) {
        List<Availability> availabilityBlocks = availabilityRepository.findByStaffProfileIdAndDayOfWeekAndIsAvailableTrue(
            staffProfile.getId(),
            date.getDayOfWeek().getValue()
        );

        List<TimeBlock> blocks = availabilityBlocks.isEmpty()
            ? List.of(new TimeBlock(DEFAULT_START, DEFAULT_END))
            : availabilityBlocks.stream()
                .map(availability -> new TimeBlock(availability.getStartTime(), availability.getEndTime()))
                .toList();

        List<Appointment> existingAppointments = appointmentRepository.findByStaffProfileIdAndAppointmentDate(
            staffProfile.getId(),
            date
        );

        int duration = service.getDurationMinutes();

        return blocks.stream()
            .flatMap(block -> block.toSlots(duration).stream())
            .filter(slot -> existingAppointments.stream().noneMatch(existing -> overlaps(slot, existing)))
            .sorted(Comparator.comparing(PublicBookingTimeSlot::startTime))
            .toList();
    }

    private boolean overlaps(PublicBookingTimeSlot slot, Appointment appointment) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            return false;
        }

        return slot.startTime().isBefore(appointment.getEndTime())
            && slot.endTime().isAfter(appointment.getStartTime());
    }

    private CustomerProfile findOrCreateCustomer(Studio studio, PublicBookingCreateRequest request) {
        String normalizedEmail = normalizeNullable(request.email());
        String normalizedPhone = request.phone().trim();

        CustomerProfile customerProfile = normalizedEmail != null
            ? customerProfileRepository.findByStudioIdAndEmailIgnoreCase(studio.getId(), normalizedEmail).orElse(null)
            : null;

        if (customerProfile == null) {
            customerProfile = customerProfileRepository.findByStudioIdAndPhone(studio.getId(), normalizedPhone).orElse(null);
        }

        if (customerProfile == null) {
            customerProfile = new CustomerProfile();
            customerProfile.setStudio(studio);
            customerProfile.setIsActive(true);
        }

        customerProfile.setFullName(request.fullName().trim());
        customerProfile.setEmail(normalizedEmail);
        customerProfile.setPhone(normalizedPhone);

        return customerProfileRepository.save(customerProfile);
    }

    private Studio resolveStudio(String studioSlug) {
        return studioRepository.findByIsActiveTrue()
            .stream()
            .filter(studio -> toSlug(studio).equals(studioSlug))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found"));
    }

    private Service findService(UUID id) {
        return serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }

    private StaffProfile findStaffProfile(UUID id) {
        return staffProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Staff profile not found"));
    }

    private void ensureSameStudio(Studio studio, Service service, StaffProfile staffProfile) {
        UUID studioId = studio.getId();

        if (!service.getStudio().getId().equals(studioId)) {
            throw new BadRequestException("Selected service is not available for this studio");
        }

        if (!staffProfile.getStudio().getId().equals(studioId) || staffProfile.getStatus() != StaffStatus.ACTIVE) {
            throw new BadRequestException("Selected staff member is not available for this studio");
        }
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String toSlug(Studio studio) {
        return studio.getName()
            .trim()
            .toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");
    }

    private record TimeBlock(LocalTime start, LocalTime end) {

        private List<PublicBookingTimeSlot> toSlots(int durationMinutes) {
            java.util.ArrayList<PublicBookingTimeSlot> slots = new java.util.ArrayList<>();
            LocalTime current = start;

            while (!current.plusMinutes(durationMinutes).isAfter(end)) {
                LocalTime slotEnd = current.plusMinutes(durationMinutes);
                slots.add(new PublicBookingTimeSlot(current, slotEnd, formatLabel(current, slotEnd)));
                current = current.plusMinutes(SLOT_INTERVAL_MINUTES);
            }

            return slots;
        }

        private static String formatLabel(LocalTime start, LocalTime end) {
            return start.format(SLOT_FORMATTER) + " - " + end.format(SLOT_FORMATTER);
        }
    }
}
