package com.studioflow.dto.inventory;

import com.studioflow.enums.InventoryProductCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record InventoryProductUpdateRequest(
    @NotNull UUID studioId,
    @NotBlank @Size(max = 160) String name,
    @NotNull InventoryProductCategory category,
    @Size(max = 5000) String description,
    @Size(max = 80) String sku,
    @NotNull @DecimalMin(value = "0.00") BigDecimal unitPrice,
    @NotNull @PositiveOrZero Integer quantityInStock,
    @NotNull @PositiveOrZero Integer reorderThreshold,
    Boolean isActive
) {
}
