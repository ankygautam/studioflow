package com.studioflow.service.auth;

import com.studioflow.dto.auth.AuthLoginRequest;
import com.studioflow.dto.auth.AuthRegisterRequest;
import com.studioflow.dto.auth.AuthResponse;
import com.studioflow.dto.auth.AuthUserResponse;
import com.studioflow.entity.Studio;
import com.studioflow.entity.User;
import com.studioflow.enums.BusinessType;
import com.studioflow.enums.AuditActionType;
import com.studioflow.enums.AuditEntityType;
import com.studioflow.enums.UserRole;
import com.studioflow.exception.BadRequestException;
import com.studioflow.repository.StudioRepository;
import com.studioflow.repository.UserRepository;
import com.studioflow.security.JwtService;
import com.studioflow.security.StudioFlowUserPrincipal;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);
    private static final String DEFAULT_SIGNUP_TIMEZONE = "America/Edmonton";

    private final StudioRepository studioRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StudioWorkspaceResolver studioWorkspaceResolver;
    private final com.studioflow.service.AuditLogService auditLogService;

    public AuthResponse register(@Valid AuthRegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            LOGGER.warn("Registration rejected because the email is already in use. email={}", maskEmail(email));
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.OWNER);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        Studio studio = new Studio();
        studio.setOwnerUser(savedUser);
        studio.setName(request.studioName().trim());
        studio.setBusinessType(BusinessType.SALON);
        studio.setTimezone(DEFAULT_SIGNUP_TIMEZONE);
        studio.setIsActive(true);
        studio.setOnboardingCompleted(false);
        studioRepository.save(studio);

        LOGGER.info(
            "Registered new workspace owner account. userId={} studioId={} role={}",
            savedUser.getId(),
            studio.getId(),
            savedUser.getRole()
        );
        StudioFlowUserPrincipal principal = new StudioFlowUserPrincipal(savedUser);
        return new AuthResponse(jwtService.generateToken(principal), toUserResponse(savedUser));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(@Valid AuthLoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> {
                LOGGER.warn("Login rejected because the account was not found. email={}", maskEmail(email));
                return new BadCredentialsException("Invalid email or password");
            });

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            LOGGER.warn("Login rejected for inactive account. userId={} role={}", user.getId(), user.getRole());
            throw new BadCredentialsException("This account is inactive");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            LOGGER.warn("Login rejected because the password did not match. userId={} role={}", user.getId(), user.getRole());
            throw new BadCredentialsException("Invalid email or password");
        }

        StudioFlowUserPrincipal principal = new StudioFlowUserPrincipal(user);
        UUID studioId = resolveStudioId(user.getId());
        if (studioId != null) {
            auditLogService.logAsActor(
                user,
                studioId,
                resolveLocationId(user.getId()),
                AuditEntityType.AUTH,
                user.getId(),
                AuditActionType.LOGIN,
                "Login successful",
                user.getFullName() + " signed in."
            );
        }
        LOGGER.info("Login successful. userId={} role={} studioId={}", user.getId(), user.getRole(), studioId);
        return new AuthResponse(jwtService.generateToken(principal), toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthUserResponse getCurrentUser(StudioFlowUserPrincipal principal) {
        StudioWorkspaceContext workspaceContext = studioWorkspaceResolver.resolveForUser(principal.getId());
        return new AuthUserResponse(
            principal.getId(),
            principal.getFullName(),
            principal.getUsername(),
            principal.getRole(),
            workspaceContext.studioId(),
            workspaceContext.studioName(),
            workspaceContext.locationId(),
            workspaceContext.onboardingCompleted()
        );
    }

    private AuthUserResponse toUserResponse(User user) {
        StudioWorkspaceContext workspaceContext = studioWorkspaceResolver.resolveForUser(user.getId());
        return new AuthUserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            workspaceContext.studioId(),
            workspaceContext.studioName(),
            workspaceContext.locationId(),
            workspaceContext.onboardingCompleted()
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }

        return email.charAt(0) + "***" + email.substring(atIndex);
    }

    private UUID resolveStudioId(UUID userId) {
        return studioWorkspaceResolver.resolveForUser(userId).studioId();
    }

    private UUID resolveLocationId(UUID userId) {
        return studioWorkspaceResolver.resolveForUser(userId).locationId();
    }
}
