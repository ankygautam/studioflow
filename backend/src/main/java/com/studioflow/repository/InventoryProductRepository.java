package com.studioflow.repository;

import com.studioflow.entity.InventoryProduct;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryProductRepository extends JpaRepository<InventoryProduct, UUID> {

    List<InventoryProduct> findByStudioId(UUID studioId);
}
