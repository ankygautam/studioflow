package com.studioflow.controller;

import java.time.Instant;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "message", "StudioFlow backend running",
            "status", "ok",
            "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "message", "StudioFlow backend running",
            "status", "ok",
            "timestamp", Instant.now().toString()
        ));
    }
}
