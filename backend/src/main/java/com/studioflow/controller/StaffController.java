package com.studioflow.controller;

import com.studioflow.dto.staff.CreateStaffRequest;
import com.studioflow.dto.staff.StaffResponse;
import com.studioflow.dto.staff.UpdateStaffRequest;
import com.studioflow.service.StaffManagementService;
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
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffManagementService staffManagementService;

    @PostMapping
    public ResponseEntity<StaffResponse> create(@Valid @RequestBody CreateStaffRequest request) {
        StaffResponse response = staffManagementService.create(request);
        return ResponseEntity.created(URI.create("/api/staff/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<StaffResponse>> getAll(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(staffManagementService.getAll(studioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(staffManagementService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateStaffRequest request
    ) {
        return ResponseEntity.ok(staffManagementService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        staffManagementService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
