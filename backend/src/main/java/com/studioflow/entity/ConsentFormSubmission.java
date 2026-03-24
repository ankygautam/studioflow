package com.studioflow.entity;

import com.studioflow.enums.ConsentFormStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "consent_form_submissions")
@Getter
@Setter
@NoArgsConstructor
public class ConsentFormSubmission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ConsentFormTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_profile_id", nullable = false)
    private CustomerProfile customerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private ConsentFormStatus status;

    @Column(name = "signed_at")
    private Instant signedAt;

    @Column(name = "signature_image_url", columnDefinition = "text")
    private String signatureImageUrl;
}
