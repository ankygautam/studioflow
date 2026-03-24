package com.studioflow.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_profiles")
@Getter
@Setter
@NoArgsConstructor
public class CustomerProfile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "customerProfile", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "customerProfile", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<ConsentFormSubmission> consentFormSubmissions = new ArrayList<>();
}
