package com.studioflow.service;

import com.studioflow.dto.client.ClientResponse;
import com.studioflow.dto.client.CreateClientRequest;
import com.studioflow.dto.client.UpdateClientRequest;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Studio;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.StudioRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientManagementService {

    private final CustomerProfileRepository customerProfileRepository;
    private final StudioRepository studioRepository;

    public ClientResponse create(CreateClientRequest request) {
        Studio studio = findStudio(request.studioId());
        CustomerProfile profile = new CustomerProfile();
        mapRequest(profile, request, studio, request.isActive() != null ? request.isActive() : Boolean.TRUE);

        return toResponse(customerProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getAll(UUID studioId) {
        List<CustomerProfile> clients = studioId == null
            ? customerProfileRepository.findAll()
            : customerProfileRepository.findByStudioId(studioId);

        return clients.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getById(UUID id) {
        return toResponse(findClient(id));
    }

    public ClientResponse update(UUID id, UpdateClientRequest request) {
        CustomerProfile profile = findClient(id);
        Studio studio = findStudio(request.studioId());
        mapRequest(
            profile,
            request,
            studio,
            request.isActive() != null ? request.isActive() : profile.getIsActive()
        );

        return toResponse(customerProfileRepository.save(profile));
    }

    public void deactivate(UUID id) {
        CustomerProfile profile = findClient(id);
        profile.setIsActive(false);
        customerProfileRepository.save(profile);
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private CustomerProfile findClient(UUID id) {
        return customerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    private void mapRequest(
        CustomerProfile profile,
        CreateClientRequest request,
        Studio studio,
        Boolean isActive
    ) {
        profile.setStudio(studio);
        profile.setFullName(request.fullName());
        profile.setEmail(request.email());
        profile.setPhone(request.phone());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setNotes(request.notes());
        profile.setIsActive(isActive);
    }

    private void mapRequest(
        CustomerProfile profile,
        UpdateClientRequest request,
        Studio studio,
        Boolean isActive
    ) {
        profile.setStudio(studio);
        profile.setFullName(request.fullName());
        profile.setEmail(request.email());
        profile.setPhone(request.phone());
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setNotes(request.notes());
        profile.setIsActive(isActive);
    }

    private ClientResponse toResponse(CustomerProfile profile) {
        return new ClientResponse(
            profile.getId(),
            profile.getStudio().getId(),
            profile.getStudio().getName(),
            profile.getFullName(),
            profile.getEmail(),
            profile.getPhone(),
            profile.getDateOfBirth(),
            profile.getNotes(),
            profile.getIsActive(),
            profile.getCreatedAt(),
            profile.getUpdatedAt()
        );
    }
}
