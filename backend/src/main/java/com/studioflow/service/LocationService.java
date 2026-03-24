package com.studioflow.service;

import com.studioflow.dto.location.LocationCreateRequest;
import com.studioflow.dto.location.LocationResponse;
import com.studioflow.dto.location.LocationUpdateRequest;
import com.studioflow.entity.Location;
import com.studioflow.entity.Studio;
import com.studioflow.exception.BadRequestException;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class LocationService {

    private final CurrentUserService currentUserService;
    private final LocationRepository locationRepository;
    private final StudioRepository studioRepository;

    public LocationResponse createLocation(LocationCreateRequest request) {
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        Location location = new Location();
        mapRequest(location, request, studio, request.isActive() != null ? request.isActive() : Boolean.TRUE);
        return toResponse(locationRepository.save(location));
    }

    @Transactional(readOnly = true)
    public List<LocationResponse> getLocations(UUID studioId, boolean activeOnly) {
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<Location> locations = activeOnly
            ? locationRepository.findByStudioIdAndIsActiveTrueOrderByNameAsc(authorizedStudioId)
            : locationRepository.findByStudioIdOrderByNameAsc(authorizedStudioId);

        return locations.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public LocationResponse getLocationById(UUID id) {
        Location location = findLocation(id);
        currentUserService.ensureStudioAccess(location.getStudio().getId());
        return toResponse(location);
    }

    public LocationResponse updateLocation(UUID id, LocationUpdateRequest request) {
        Location location = findLocation(id);
        currentUserService.ensureStudioAccess(location.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        mapRequest(location, request, studio, request.isActive() != null ? request.isActive() : location.getIsActive());
        return toResponse(locationRepository.save(location));
    }

    public void deleteLocation(UUID id) {
        Location location = findLocation(id);
        currentUserService.ensureStudioAccess(location.getStudio().getId());
        location.setIsActive(false);
        locationRepository.save(location);
    }

    public Location findLocation(UUID id) {
        return locationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + id));
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private void mapRequest(Location location, LocationCreateRequest request, Studio studio, Boolean isActive) {
        location.setStudio(studio);
        location.setName(request.name().trim());
        location.setSlug(resolveSlug(request.slug(), request.name(), location.getId()));
        location.setPhone(normalizeNullable(request.phone()));
        location.setEmail(normalizeNullable(request.email()));
        location.setAddressLine1(normalizeNullable(request.addressLine1()));
        location.setAddressLine2(normalizeNullable(request.addressLine2()));
        location.setCity(normalizeNullable(request.city()));
        location.setProvinceOrState(normalizeNullable(request.provinceOrState()));
        location.setPostalCode(normalizeNullable(request.postalCode()));
        location.setCountry(normalizeNullable(request.country()));
        location.setTimezone(request.timezone().trim());
        location.setIsActive(isActive);
    }

    private void mapRequest(Location location, LocationUpdateRequest request, Studio studio, Boolean isActive) {
        location.setStudio(studio);
        location.setName(request.name().trim());
        location.setSlug(resolveSlug(request.slug(), request.name(), location.getId()));
        location.setPhone(normalizeNullable(request.phone()));
        location.setEmail(normalizeNullable(request.email()));
        location.setAddressLine1(normalizeNullable(request.addressLine1()));
        location.setAddressLine2(normalizeNullable(request.addressLine2()));
        location.setCity(normalizeNullable(request.city()));
        location.setProvinceOrState(normalizeNullable(request.provinceOrState()));
        location.setPostalCode(normalizeNullable(request.postalCode()));
        location.setCountry(normalizeNullable(request.country()));
        location.setTimezone(request.timezone().trim());
        location.setIsActive(isActive);
    }

    private String resolveSlug(String requestedSlug, String fallbackName, UUID currentId) {
        String baseSlug = slugify(requestedSlug == null || requestedSlug.isBlank() ? fallbackName : requestedSlug);
        String candidate = baseSlug;
        int suffix = 2;

        while (locationRepository.existsBySlugIgnoreCase(candidate)) {
            if (currentId != null) {
                Location existing = locationRepository.findByStudioIdAndSlugIgnoreCase(currentUserService.getCurrentStudioId(), candidate).orElse(null);
                if (existing != null && existing.getId().equals(currentId)) {
                    break;
                }
            }

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

    private LocationResponse toResponse(Location location) {
        return new LocationResponse(
            location.getId(),
            location.getStudio().getId(),
            location.getName(),
            location.getSlug(),
            location.getPhone(),
            location.getEmail(),
            location.getAddressLine1(),
            location.getAddressLine2(),
            location.getCity(),
            location.getProvinceOrState(),
            location.getPostalCode(),
            location.getCountry(),
            location.getTimezone(),
            location.getIsActive(),
            location.getCreatedAt(),
            location.getUpdatedAt()
        );
    }
}
