package com.studioflow.entity;

import com.studioflow.enums.StaffStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "staff_profiles")
@Getter
@Setter
@NoArgsConstructor
public class StaffProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "studio_id", nullable = false)
    private Studio studio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_location_id")
    private Location primaryLocation;

    @Column(name = "display_name", length = 160)
    private String displayName;

    @Column(name = "job_title", length = 120)
    private String jobTitle;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "bio", columnDefinition = "text")
    private String bio;

    @Column(name = "avatar_url", columnDefinition = "text")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private StaffStatus status;

    @OneToMany(mappedBy = "staffProfile", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<StaffServiceAssignment> staffServices = new ArrayList<>();

    @OneToMany(mappedBy = "staffProfile", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Availability> availabilities = new ArrayList<>();

    @OneToMany(mappedBy = "staffProfile", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Appointment> appointments = new ArrayList<>();
}
