package com.studioflow.config;

import com.studioflow.entity.Location;
import com.studioflow.entity.StaffProfile;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.StaffStatus;
import com.studioflow.enums.UserRole;
import com.studioflow.repository.LocationRepository;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.StudioRepository;
import com.studioflow.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("local")
@RequiredArgsConstructor
public class LocalAuthSeeder {

    private static final UUID DEMO_STUDIO_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID DEMO_LOCATION_ID = UUID.fromString("12121212-1212-1212-1212-121212121212");

    private final LocationRepository locationRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final StudioRepository studioRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedLocalAuthUsers() {
        return (args) -> List.of(
            new SeedUser("Avery North", "admin@studioflow.co", UserRole.ADMIN),
            new SeedUser("Nina Hart", "staff@studioflow.co", UserRole.STAFF),
            new SeedUser("Leah Carter", "receptionist@studioflow.co", UserRole.RECEPTIONIST),
            new SeedUser("Maya Laurent", "customer@studioflow.co", UserRole.CUSTOMER)
        ).forEach(this::upsertUser);
    }

    private void upsertUser(SeedUser seedUser) {
        User user = userRepository.findByEmailIgnoreCase(seedUser.email())
            .orElseGet(User::new);

        user.setFullName(seedUser.fullName());
        user.setEmail(seedUser.email());
        user.setRole(seedUser.role());
        user.setIsActive(true);
        user.setPasswordHash(passwordEncoder.encode("password123"));

        User savedUser = userRepository.save(user);

        if (seedUser.role() == UserRole.CUSTOMER) {
            return;
        }

        studioRepository.findById(DEMO_STUDIO_ID)
            .ifPresent((studio) -> locationRepository.findById(DEMO_LOCATION_ID)
                .ifPresent((location) -> upsertStaffProfile(savedUser, studio, location, seedUser)));
    }

    private void upsertStaffProfile(User user, Studio studio, Location location, SeedUser seedUser) {
        StaffProfile staffProfile = staffProfileRepository.findByUserId(user.getId())
            .orElseGet(StaffProfile::new);

        staffProfile.setUser(user);
        staffProfile.setStudio(studio);
        staffProfile.setPrimaryLocation(location);
        staffProfile.setDisplayName(seedUser.fullName());
        staffProfile.setJobTitle(defaultJobTitle(seedUser.role()));
        staffProfile.setPhone("(555) 555-0100");
        staffProfile.setBio("Local demo auth profile for StudioFlow.");
        staffProfile.setAvatarUrl("");
        staffProfile.setStatus(StaffStatus.ACTIVE);

        staffProfileRepository.save(staffProfile);
    }

    private String defaultJobTitle(UserRole role) {
        return switch (role) {
            case ADMIN -> "Studio Admin";
            case RECEPTIONIST -> "Front Desk Coordinator";
            case STAFF -> "Service Artist";
            case CUSTOMER -> "Customer";
        };
    }

    private record SeedUser(String fullName, String email, UserRole role) {
    }
}
