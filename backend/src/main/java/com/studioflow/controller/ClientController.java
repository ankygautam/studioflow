package com.studioflow.controller;

import com.studioflow.dto.client.ClientResponse;
import com.studioflow.dto.client.CreateClientRequest;
import com.studioflow.dto.client.UpdateClientRequest;
import com.studioflow.service.ClientManagementService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    private final ClientManagementService clientManagementService;

    @PostMapping
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody CreateClientRequest request) {
        ClientResponse response = clientManagementService.create(request);
        return ResponseEntity.created(URI.create("/api/clients/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAll(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(clientManagementService.getAll(studioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientManagementService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateClientRequest request
    ) {
        return ResponseEntity.ok(clientManagementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        clientManagementService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
