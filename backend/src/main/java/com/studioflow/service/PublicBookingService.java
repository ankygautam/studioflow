package com.studioflow.service;

import com.studioflow.dto.booking.PublicBookingAvailabilityResponse;
import com.studioflow.dto.booking.PublicBookingCancelRequest;
import com.studioflow.dto.booking.PublicBookingConfirmationResponse;
import com.studioflow.dto.booking.PublicBookingCreateRequest;
import com.studioflow.dto.booking.PublicBookingLookupRequest;
import com.studioflow.dto.booking.PublicBookingLookupResponse;
import com.studioflow.dto.booking.PublicBookingManageResponse;
import com.studioflow.dto.booking.PublicBookingRescheduleRequest;
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
import com.studioflow.security.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;
import java.security.SecureRandom;
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
    private static final String LOOKUP_FAILURE_MESSAGE = "We couldn't match that booking. Check the reference and contact details, then try again.";
    private static final String PUBLIC_REFERENCE_PREFIX = "SF";
    private static final String PUBLIC_REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StudioRepository studioRepository;
    private final ServiceRepository serviceRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StaffServiceRepository staffServiceRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final JwtService jwtService;

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
        appointment.setBookingReference(generateBookingReference());
        appointment.setNotes(normalizeNullable(request.notes()));
        appointment.setSource(AppointmentSource.ONLINE_BOOKING);

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return new PublicBookingConfirmationResponse(
            savedAppointment.getId(),
            savedAppointment.getBookingReference(),
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

    @Transactional(readOnly = true)
    public PublicBookingLookupResponse lookupBooking(String studioSlug, @Valid PublicBookingLookupRequest request) {
        Studio studio = resolveStudio(studioSlug);
        Appointment appointment = findBookingForLookup(studio, request.bookingReference());
        validateLookupRequest(appointment, request);

        return toLookupResponse(studio, appointment);
    }

    public PublicBookingManageResponse cancelBooking(String studioSlug, @Valid PublicBookingCancelRequest request) {
        Studio studio = resolveStudio(studioSlug);
        Appointment appointment = resolveManagedAppointment(studio, request.manageToken());

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            return toManageResponse(studio, appointment, "This booking is already cancelled.");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw new BadRequestException("This booking can no longer be cancelled from the public portal.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return toManageResponse(studio, savedAppointment, "Your booking has been cancelled.");
    }

    public PublicBookingManageResponse rescheduleBooking(String studioSlug, @Valid PublicBookingRescheduleRequest request) {
        if (request.appointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Please choose today or a future date");
        }

        Studio studio = resolveStudio(studioSlug);
        Appointment appointment = resolveManagedAppointment(studio, request.manageToken());

        if (appointment.getStatus() == AppointmentStatus.CANCELLED || appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw new BadRequestException("This booking can no longer be rescheduled from the public portal.");
        }

        LocalTime endTime = request.startTime().plusMinutes(appointment.getService().getDurationMinutes());
        boolean available = buildSlots(
            appointment.getStaffProfile(),
            appointment.getService(),
            request.appointmentDate(),
            appointment.getId()
        )
            .stream()
            .anyMatch(slot -> slot.startTime().equals(request.startTime()) && slot.endTime().equals(endTime));

        if (!available) {
            throw new BadRequestException("That time is no longer available. Please choose another slot.");
        }

        appointment.setAppointmentDate(request.appointmentDate());
        appointment.setStartTime(request.startTime());
        appointment.setEndTime(endTime);
        appointment.setStatus(AppointmentStatus.BOOKED);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        return toManageResponse(studio, savedAppointment, "Your booking has been rescheduled.");
    }

    private List<PublicBookingTimeSlot> buildSlots(StaffProfile staffProfile, Service service, LocalDate date) {
        return buildSlots(staffProfile, service, date, null);
    }

    private List<PublicBookingTimeSlot> buildSlots(
        StaffProfile staffProfile,
        Service service,
        LocalDate date,
        UUID ignoredAppointmentId
    ) {
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
            .filter(slot -> existingAppointments.stream().noneMatch(existing -> overlaps(slot, existing, ignoredAppointmentId)))
            .sorted(Comparator.comparing(PublicBookingTimeSlot::startTime))
            .toList();
    }

    private boolean overlaps(PublicBookingTimeSlot slot, Appointment appointment, UUID ignoredAppointmentId) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            return false;
        }

        if (ignoredAppointmentId != null && ignoredAppointmentId.equals(appointment.getId())) {
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

    private Appointment findBookingForLookup(Studio studio, String bookingReference) {
        String normalizedReference = normalizeReference(bookingReference);
        return appointmentRepository.findByStudioIdAndBookingReferenceIgnoreCase(studio.getId(), normalizedReference)
            .orElseThrow(() -> new ResourceNotFoundException(LOOKUP_FAILURE_MESSAGE));
    }

    private void validateLookupRequest(Appointment appointment, PublicBookingLookupRequest request) {
        String normalizedEmail = normalizeNullable(request.email());
        String normalizedPhone = normalizeNullable(request.phone());

        if (normalizedEmail == null && normalizedPhone == null) {
            throw new BadRequestException("Enter the booking reference and the same email or phone you used when booking.");
        }

        CustomerProfile customerProfile = appointment.getCustomerProfile();

        if (normalizedEmail != null) {
            String customerEmail = normalizeNullable(customerProfile.getEmail());
            if (customerEmail == null || !customerEmail.equalsIgnoreCase(normalizedEmail)) {
                throw new ResourceNotFoundException(LOOKUP_FAILURE_MESSAGE);
            }
        }

        if (normalizedPhone != null) {
            String customerPhone = normalizeNullable(customerProfile.getPhone());
            if (customerPhone == null || !customerPhone.equals(normalizedPhone)) {
                throw new ResourceNotFoundException(LOOKUP_FAILURE_MESSAGE);
            }
        }
    }

    private PublicBookingLookupResponse toLookupResponse(Studio studio, Appointment appointment) {
        return new PublicBookingLookupResponse(
            jwtService.generatePublicBookingManageToken(appointment.getId(), studio.getId(), appointment.getBookingReference()),
            appointment.getBookingReference(),
            appointment.getId(),
            studio.getId(),
            toSlug(studio),
            studio.getName(),
            appointment.getService().getId(),
            appointment.getService().getName(),
            appointment.getStaffProfile().getId(),
            appointment.getStaffProfile().getDisplayName(),
            appointment.getCustomerProfile().getFullName(),
            appointment.getCustomerProfile().getEmail(),
            appointment.getCustomerProfile().getPhone(),
            appointment.getAppointmentDate(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getStatus()
        );
    }

    private Appointment resolveManagedAppointment(Studio studio, String manageToken) {
        JwtService.PublicBookingManageClaims claims;

        try {
            claims = jwtService.parsePublicBookingManageToken(manageToken);
        } catch (IllegalArgumentException | JwtException exception) {
            throw new BadRequestException("Booking access could not be verified. Please look up your booking again.");
        }

        if (!studio.getId().equals(claims.studioId())) {
            throw new BadRequestException("Booking access could not be verified. Please look up your booking again.");
        }

        Appointment appointment = appointmentRepository.findById(claims.appointmentId())
            .orElseThrow(() -> new ResourceNotFoundException(LOOKUP_FAILURE_MESSAGE));

        if (!appointment.getStudio().getId().equals(studio.getId())) {
            throw new ResourceNotFoundException(LOOKUP_FAILURE_MESSAGE);
        }

        if (appointment.getBookingReference() == null || !appointment.getBookingReference().equalsIgnoreCase(claims.bookingReference())) {
            throw new BadRequestException("Booking access could not be verified. Please look up your booking again.");
        }

        return appointment;
    }

    private PublicBookingManageResponse toManageResponse(Studio studio, Appointment appointment, String message) {
        return new PublicBookingManageResponse(
            message,
            appointment.getBookingReference(),
            appointment.getId(),
            studio.getId(),
            toSlug(studio),
            studio.getName(),
            appointment.getCustomerProfile().getFullName(),
            appointment.getService().getName(),
            appointment.getStaffProfile().getDisplayName(),
            appointment.getAppointmentDate(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getStatus()
        );
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeReference(String value) {
        return value.trim().toUpperCase();
    }

    private String generateBookingReference() {
        for (int attempt = 0; attempt < 12; attempt += 1) {
            String candidate = PUBLIC_REFERENCE_PREFIX + "-" + randomReferenceSegment(6);
            if (!appointmentRepository.existsByBookingReferenceIgnoreCase(candidate)) {
                return candidate;
            }
        }

        return PUBLIC_REFERENCE_PREFIX + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String randomReferenceSegment(int length) {
        StringBuilder builder = new StringBuilder(length);

        for (int index = 0; index < length; index += 1) {
            int randomIndex = SECURE_RANDOM.nextInt(PUBLIC_REFERENCE_ALPHABET.length());
            builder.append(PUBLIC_REFERENCE_ALPHABET.charAt(randomIndex));
        }

        return builder.toString();
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
