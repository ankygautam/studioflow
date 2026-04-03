package com.studioflow.service;

import com.studioflow.dto.inventory.InventoryProductCreateRequest;
import com.studioflow.dto.inventory.InventoryProductResponse;
import com.studioflow.dto.inventory.InventoryProductUpdateRequest;
import com.studioflow.entity.InventoryProduct;
import com.studioflow.entity.Studio;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.InventoryProductRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.service.auth.CurrentUserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class InventoryProductService {

    private final CurrentUserService currentUserService;
    private final InventoryProductRepository inventoryProductRepository;
    private final StudioRepository studioRepository;
    private final AuditLogService auditLogService;

    public InventoryProductResponse createProduct(InventoryProductCreateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        InventoryProduct product = new InventoryProduct();
        mapRequest(product, request, studio, request.isActive() != null ? request.isActive() : Boolean.TRUE);

        InventoryProduct savedProduct = inventoryProductRepository.save(product);
        auditLogService.log(
            AuditEntityType.INVENTORY_PRODUCT,
            savedProduct.getId(),
            AuditActionType.CREATED,
            savedProduct.getStudio().getId(),
            null,
            "Inventory product created",
            savedProduct.getName() + " was added to the inventory catalog."
        );
        return toResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<InventoryProductResponse> getAllProducts(UUID studioId) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        UUID authorizedStudioId = currentUserService.requireStudioAccess(studioId);

        return inventoryProductRepository.findByStudioId(authorizedStudioId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public InventoryProductResponse getProductById(UUID id) {
        currentUserService.requireAnyRole(
            com.studioflow.enums.UserRole.ADMIN,
            com.studioflow.enums.UserRole.RECEPTIONIST,
            com.studioflow.enums.UserRole.STAFF
        );
        InventoryProduct product = findProduct(id);
        currentUserService.ensureStudioAccess(product.getStudio().getId());
        return toResponse(product);
    }

    public InventoryProductResponse updateProduct(UUID id, InventoryProductUpdateRequest request) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        InventoryProduct product = findProduct(id);
        currentUserService.ensureStudioAccess(product.getStudio().getId());
        Studio studio = findStudio(currentUserService.requireStudioAccess(request.studioId()));

        mapRequest(product, request, studio, request.isActive() != null ? request.isActive() : product.getIsActive());

        InventoryProduct savedProduct = inventoryProductRepository.save(product);
        auditLogService.log(
            AuditEntityType.INVENTORY_PRODUCT,
            savedProduct.getId(),
            AuditActionType.UPDATED,
            savedProduct.getStudio().getId(),
            null,
            "Inventory product updated",
            savedProduct.getName() + " was updated in the inventory catalog."
        );
        return toResponse(savedProduct);
    }

    public void deleteProduct(UUID id) {
        currentUserService.requireAnyRole(com.studioflow.enums.UserRole.ADMIN);
        InventoryProduct product = findProduct(id);
        currentUserService.ensureStudioAccess(product.getStudio().getId());
        product.setIsActive(false);
        inventoryProductRepository.save(product);
        auditLogService.log(
            AuditEntityType.INVENTORY_PRODUCT,
            product.getId(),
            AuditActionType.DEACTIVATED,
            product.getStudio().getId(),
            null,
            "Inventory product deactivated",
            product.getName() + " was deactivated."
        );
    }

    private Studio findStudio(UUID id) {
        return studioRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Studio not found: " + id));
    }

    private InventoryProduct findProduct(UUID id) {
        return inventoryProductRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory product not found: " + id));
    }

    private void mapRequest(
        InventoryProduct product,
        InventoryProductCreateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        product.setStudio(studio);
        product.setName(request.name().trim());
        product.setCategory(request.category());
        product.setDescription(normalize(request.description()));
        product.setSku(normalize(request.sku()));
        product.setUnitPrice(request.unitPrice());
        product.setQuantityInStock(request.quantityInStock());
        product.setReorderThreshold(request.reorderThreshold());
        product.setIsActive(isActive);
    }

    private void mapRequest(
        InventoryProduct product,
        InventoryProductUpdateRequest request,
        Studio studio,
        Boolean isActive
    ) {
        product.setStudio(studio);
        product.setName(request.name().trim());
        product.setCategory(request.category());
        product.setDescription(normalize(request.description()));
        product.setSku(normalize(request.sku()));
        product.setUnitPrice(request.unitPrice());
        product.setQuantityInStock(request.quantityInStock());
        product.setReorderThreshold(request.reorderThreshold());
        product.setIsActive(isActive);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private InventoryProductResponse toResponse(InventoryProduct product) {
        return new InventoryProductResponse(
            product.getId(),
            product.getStudio().getId(),
            product.getName(),
            product.getCategory(),
            product.getDescription(),
            product.getSku(),
            product.getUnitPrice(),
            product.getQuantityInStock(),
            product.getReorderThreshold(),
            product.getIsActive(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}
