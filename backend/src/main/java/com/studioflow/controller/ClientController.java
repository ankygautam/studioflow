package com.studioflow.controller;

import com.studioflow.dto.client.ClientCreateRequest;
import com.studioflow.dto.client.ClientResponse;
import com.studioflow.dto.client.ClientUpdateRequest;
import com.studioflow.service.ClientService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ClientResponse> createClient(
        @Valid @RequestBody ClientCreateRequest request
    ) {
        ClientResponse response = clientService.createClient(request);
        return ResponseEntity.created(URI.create("/api/clients/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<List<ClientResponse>> getAllClients(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(clientService.getAllClients(studioId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.getClientById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<ClientResponse> updateClient(
        @PathVariable UUID id,
        @Valid @RequestBody ClientUpdateRequest request
    ) {
        return ResponseEntity.ok(clientService.updateClient(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Void> deleteClient(@PathVariable UUID id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }
}
