package com.studioflow.service.auth;

import com.studioflow.dto.auth.AuthLoginRequest;
import com.studioflow.dto.auth.AuthRegisterRequest;
import com.studioflow.dto.auth.AuthResponse;
import com.studioflow.dto.auth.AuthUserResponse;
import com.studioflow.entity.User;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.repository.StaffProfileRepository;
import com.studioflow.repository.UserRepository;
import com.studioflow.security.JwtService;
import com.studioflow.security.StudioFlowUserPrincipal;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(@Valid AuthRegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        // Public registration creates the workspace owner account only.
        user.setRole(UserRole.ADMIN);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        StudioFlowUserPrincipal principal = new StudioFlowUserPrincipal(savedUser);
        return new AuthResponse(jwtService.generateToken(principal), toUserResponse(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(@Valid AuthLoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadCredentialsException("This account is inactive");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        StudioFlowUserPrincipal principal = new StudioFlowUserPrincipal(user);
        return new AuthResponse(jwtService.generateToken(principal), toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthUserResponse getCurrentUser(StudioFlowUserPrincipal principal) {
        return new AuthUserResponse(
            principal.getId(),
            principal.getFullName(),
            principal.getUsername(),
            principal.getRole(),
            resolveStudioId(principal.getId()),
            resolveLocationId(principal.getId()),
            resolveOnboardingCompleted(principal.getId())
        );
    }

    private AuthUserResponse toUserResponse(User user) {
        return new AuthUserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            resolveStudioId(user.getId()),
            resolveLocationId(user.getId()),
            resolveOnboardingCompleted(user.getId())
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private UUID resolveStudioId(UUID userId) {
        return staffProfileRepository.findByUserId(userId)
            .map(staffProfile -> staffProfile.getStudio().getId())
            .orElse(null);
    }

    private UUID resolveLocationId(UUID userId) {
        return staffProfileRepository.findByUserId(userId)
            .map(staffProfile -> staffProfile.getPrimaryLocation() != null ? staffProfile.getPrimaryLocation().getId() : null)
            .orElse(null);
    }

    private boolean resolveOnboardingCompleted(UUID userId) {
        return staffProfileRepository.findByUserId(userId)
            .map(staffProfile -> Boolean.TRUE.equals(staffProfile.getStudio().getOnboardingCompleted()))
            .orElse(false);
    }
}
