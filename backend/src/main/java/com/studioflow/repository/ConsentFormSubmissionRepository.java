package com.studioflow.repository;

import com.studioflow.entity.ConsentFormSubmission;
import com.studioflow.enums.ConsentFormStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsentFormSubmissionRepository extends JpaRepository<ConsentFormSubmission, UUID> {

    List<ConsentFormSubmission> findByStudioId(UUID studioId);

    List<ConsentFormSubmission> findByAppointmentId(UUID appointmentId);

    List<ConsentFormSubmission> findByCustomerProfileId(UUID customerProfileId);

    List<ConsentFormSubmission> findByStatus(ConsentFormStatus status);
}
