package com.studioflow.repository;

import com.studioflow.entity.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByStudioId(UUID studioId);

    List<Notification> findByUserId(UUID userId);

    List<Notification> findByUserIdAndIsReadFalse(UUID userId);
}
