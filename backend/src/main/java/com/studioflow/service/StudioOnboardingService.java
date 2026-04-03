package com.studioflow.service;

import com.studioflow.dto.onboarding.StudioOnboardingRequest;
import com.studioflow.dto.onboarding.StudioOnboardingResponse;
import com.studioflow.dto.onboarding.StarterServiceRequest;
import com.studioflow.entity.Location;
import com.studioflow.entity.Service;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.ServiceRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.repository.UserRepository;
import com.studioflow.service.auth.CurrentUserService;
import com.studioflow.service.auth.StudioWorkspaceResolver;
import java.math.BigDecimal;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class StudioOnboardingService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final StudioRepository studioRepository;
    private final LocationRepository locationRepository;
    private final ServiceRepository serviceRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StudioWorkspaceResolver studioWorkspaceResolver;
    private final AuditLogService auditLogService;

    public StudioOnboardingResponse onboard(StudioOnboardingRequest request) {
        if (currentUserService.getCurrentUserRole() == UserRole.CUSTOMER) {
            throw new BadRequestException("Customer accounts cannot create a studio workspace");
        }

        User user = userRepository.findById(currentUserService.getCurrentUserId())
            .orElseThrow(() -> new BadRequestException("Authenticated user not found"));

        Studio studio = studioWorkspaceResolver.findOwnedStudio(user.getId()).orElse(null);

        if (studio == null && staffProfileRepository.findByUserId(user.getId()).isPresent()) {
            throw new BadRequestException("This account has already completed studio onboarding");
        }

        if (studio == null) {
            studio = new Studio();
            studio.setOwnerUser(user);
            studio.setIsActive(true);
        }

        studio.setName(request.studioName().trim());
        studio.setBusinessType(request.businessType());
        studio.setEmail(normalizeNullable(request.studioEmail()));
        studio.setPhone(normalizeNullable(request.studioPhone()));
        studio.setAddressLine1(normalizeNullable(request.addressLine1()));
        studio.setAddressLine2(normalizeNullable(request.addressLine2()));
        studio.setCity(normalizeNullable(request.city()));
        studio.setProvinceOrState(normalizeNullable(request.provinceOrState()));
        studio.setPostalCode(normalizeNullable(request.postalCode()));
        studio.setCountry(normalizeNullable(request.country()));
        studio.setTimezone(request.timezone().trim());
        studio.setBookingLeadTimeHours(request.bookingLeadTimeHours());
        studio.setDefaultDepositRequired(Boolean.TRUE.equals(request.defaultDepositRequired()));
        studio.setDefaultDepositAmount(normalizeAmount(request.defaultDepositAmount()));
        Studio savedStudio = studioRepository.save(studio);

        Location location = locationRepository.findByStudioIdAndIsActiveTrueOrderByNameAsc(savedStudio.getId()).stream()
            .findFirst()
            .orElseGet(Location::new);

        location.setStudio(savedStudio);
        location.setName(request.locationName().trim());
        if (location.getSlug() == null || location.getSlug().isBlank()) {
            location.setSlug(generateUniqueSlug(request.locationName()));
        }
        location.setEmail(normalizeNullable(request.locationEmail()));
        location.setPhone(normalizeNullable(request.locationPhone()));
        location.setAddressLine1(normalizeNullable(request.addressLine1()));
        location.setAddressLine2(normalizeNullable(request.addressLine2()));
        location.setCity(normalizeNullable(request.city()));
        location.setProvinceOrState(normalizeNullable(request.provinceOrState()));
        location.setPostalCode(normalizeNullable(request.postalCode()));
        location.setCountry(normalizeNullable(request.country()));
        location.setTimezone(request.timezone().trim());
        location.setIsActive(true);
        Location savedLocation = locationRepository.save(location);

        if (request.starterServices() != null) {
            request.starterServices().stream()
                .filter(service -> service != null && service.name() != null && !service.name().isBlank())
                .forEach((service) -> serviceRepository.save(createStarterService(savedStudio, request, service)));
        }

        savedStudio.setOnboardingCompleted(true);
        studioRepository.save(savedStudio);
        auditLogService.log(
            AuditEntityType.ONBOARDING,
            savedStudio.getId(),
            AuditActionType.COMPLETED,
            savedStudio.getId(),
            savedLocation.getId(),
            "Studio onboarding completed",
            savedStudio.getName() + " finished onboarding and is ready to operate."
        );

        return new StudioOnboardingResponse(
            savedStudio.getId(),
            savedStudio.getName(),
            savedLocation.getId(),
            savedLocation.getName(),
            savedLocation.getSlug(),
            true
        );
    }

    private Service createStarterService(Studio studio, StudioOnboardingRequest request, StarterServiceRequest starterService) {
        Service service = new Service();
        service.setStudio(studio);
        service.setName(starterService.name().trim());
        service.setCategory(starterService.category());
        service.setDescription("Starter service created during studio onboarding");
        service.setDurationMinutes(starterService.durationMinutes());
        service.setPrice(starterService.price() != null ? starterService.price() : BigDecimal.ZERO);
        boolean depositRequired = Boolean.TRUE.equals(request.defaultDepositRequired());
        service.setDepositRequired(depositRequired);
        service.setDepositAmount(depositRequired ? normalizeAmount(request.defaultDepositAmount()) : BigDecimal.ZERO);
        service.setIsActive(true);
        return service;
    }

    private String generateUniqueSlug(String source) {
        String baseSlug = slugify(source);
        String candidate = baseSlug;
        int suffix = 2;

        while (locationRepository.existsBySlugIgnoreCase(candidate)) {
            candidate = baseSlug + "-" + suffix++;
        }

        return candidate;
    }

    private String slugify(String value) {
        String slug = value.toLowerCase(Locale.ENGLISH)
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("(^-|-$)", "");

        if (slug.isBlank()) {
            throw new BadRequestException("Location slug could not be generated");
        }

        return slug;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal normalizeAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
