package com.studioflow.service;

import com.studioflow.dto.client.ClientCreateRequest;
import com.studioflow.dto.client.ClientResponse;
import com.studioflow.dto.client.ClientUpdateRequest;
import com.studioflow.entity.CustomerProfile;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.CustomerProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final CurrentUserService currentUserService;
    private final CustomerProfileRepository customerProfileRepository;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    public ClientResponse createClient(ClientCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));
        CustomerProfile client = new CustomerProfile();

        mapCreateRequest(
            client,
            request,
            studio,
            request.isActive() != null ? request.isActive() : Boolean.TRUE
        );

        CustomerProfile savedClient = customerProfileRepository.save(client);
        auditLogService.log(
            AuditEntityType.CLIENT,
            savedClient.getId(),
            AuditActionType.CREATED,
            savedClient.getStudio().getId(),
            null,
            "Client created",
            savedClient.getFullName() + " was added to the client list."
        );
        return toResponse(savedClient);
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> getAllClients(UUID studioId) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);
        List<CustomerProfile> clients = customerProfileRepository.findByStudioId(authorizedStudioId);

        return clients.stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientById(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        CustomerProfile client = findClient(id);
        currentUserService.ensureStudioAccess(client.getStudio().getId());
        return toResponse(client);
    }

    public ClientResponse updateClient(UUID id, ClientUpdateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        CustomerProfile client = findClient(id);
        currentUserService.ensureStudioAccess(client.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        mapUpdateRequest(
            client,
            request,
            studio,
            request.isActive() != null ? request.isActive() : client.getIsActive()
        );

        CustomerProfile savedClient = customerProfileRepository.save(client);
        auditLogService.log(
            AuditEntityType.CLIENT,
            savedClient.getId(),
            AuditActionType.UPDATED,
            savedClient.getStudio().getId(),
            null,
            "Client updated",
            savedClient.getFullName() + " was updated."
        );
        return toResponse(savedClient);
    }

    public void deleteClient(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN, com.studioflow.enums.UserRole.RECEPTIONIST);
        CustomerProfile client = findClient(id);
        currentUserService.ensureStudioAccess(client.getStudio().getId());
        client.setIsActive(false);
        customerProfileRepository.save(client);
        auditLogService.log(
            AuditEntityType.CLIENT,
            client.getId(),
            AuditActionType.DEACTIVATED,
            client.getStudio().getId(),
            null,
            "Client deactivated",
            client.getFullName() + " was marked inactive."
        );
    }

    private Studio findStudio(UUID studioId) {
        return studioRepository.findById(studioId)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + studioId));
    }

    private CustomerProfile findClient(UUID id) {
        return customerProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + id));
    }

    private void mapCreateRequest(
        CustomerProfile client,
        ClientCreateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        client.setStudio(studio);
        client.setFullName(request.fullName());
        client.setEmail(request.email());
        client.setPhone(request.phone());
        client.setDateOfBirth(request.dateOfBirth());
        client.setNotes(request.notes());
        client.setIsActive(isActive);
    }

    private void mapUpdateRequest(
        CustomerProfile client,
        ClientUpdateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        client.setStudio(studio);
        client.setFullName(request.fullName());
        client.setEmail(request.email());
        client.setPhone(request.phone());
        client.setDateOfBirth(request.dateOfBirth());
        client.setNotes(request.notes());
        client.setIsActive(isActive);
    }

    private ClientResponse toResponse(CustomerProfile client) {
        return new ClientResponse(
            client.getId(),
            client.getStudio().getId(),
            client.getFullName(),
            client.getEmail(),
            client.getPhone(),
            client.getDateOfBirth(),
            client.getNotes(),
            client.getIsActive(),
            client.getCreatedAt(),
            client.getUpdatedAt(),
            client.getStudio().getName()
        );
    }
}
