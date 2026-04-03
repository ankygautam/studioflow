package com.studioflow.dto.inventory;

import com.studioflow.enums.InventoryProductCategory;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InventoryProductResponse(
    UUID id,
    UUID studioId,
    String name,
    InventoryProductCategory category,
    String description,
    String sku,
    BigDecimal unitPrice,
    Integer quantityInStock,
    Integer reorderThreshold,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
}
