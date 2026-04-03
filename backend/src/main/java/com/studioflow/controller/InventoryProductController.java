package com.studioflow.controller;

import com.studioflow.dto.inventory.InventoryProductCreateRequest;
import com.studioflow.dto.inventory.InventoryProductResponse;
import com.studioflow.dto.inventory.InventoryProductUpdateRequest;
import com.studioflow.service.InventoryProductService;
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
@RequestMapping("/api/inventory/products")
@RequiredArgsConstructor
public class InventoryProductController {

    private final InventoryProductService inventoryProductService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryProductResponse> createProduct(
        @Valid @RequestBody InventoryProductCreateRequest request
    ) {
        InventoryProductResponse response = inventoryProductService.createProduct(request);
        return ResponseEntity.created(URI.create("/api/inventory/products/" + response.id())).body(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<List<InventoryProductResponse>> getAllProducts(
        @RequestParam(required = false) UUID studioId
    ) {
        return ResponseEntity.ok(inventoryProductService.getAllProducts(studioId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','STAFF')")
    public ResponseEntity<InventoryProductResponse> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(inventoryProductService.getProductById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryProductResponse> updateProduct(
        @PathVariable UUID id,
        @Valid @RequestBody InventoryProductUpdateRequest request
    ) {
        return ResponseEntity.ok(inventoryProductService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        inventoryProductService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
