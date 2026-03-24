package com.studioflow.entity;

import com.studioflow.enums.BusinessType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "studios")
@Getter
@Setter
@NoArgsConstructor
public class Studio extends BaseEntity {

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 40)
    private BusinessType businessType;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "address_line_1", length = 160)
    private String addressLine1;

    @Column(name = "address_line_2", length = 160)
    private String addressLine2;

    @Column(name = "city", length = 80)
    private String city;

    @Column(name = "province_or_state", length = 80)
    private String provinceOrState;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 80)
    private String country;

    @Column(name = "timezone", nullable = false, length = 80)
    private String timezone;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<StaffProfile> staffProfiles = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<CustomerProfile> customerProfiles = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Service> services = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<ConsentFormTemplate> consentFormTemplates = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<ConsentFormSubmission> consentFormSubmissions = new ArrayList<>();

    @OneToMany(mappedBy = "studio", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Notification> notifications = new ArrayList<>();
}
