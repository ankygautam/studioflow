package com.studioflow.controller;

import com.studioflow.dto.onboarding.StudioOnboardingRequest;
import com.studioflow.dto.onboarding.StudioOnboardingResponse;
import com.studioflow.service.StudioOnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class StudioOnboardingController {

    private final StudioOnboardingService studioOnboardingService;

    @PostMapping("/studio")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudioOnboardingResponse> onboardStudio(
        @Valid @RequestBody StudioOnboardingRequest request
    ) {
        return ResponseEntity.ok(studioOnboardingService.onboard(request));
    }
}
