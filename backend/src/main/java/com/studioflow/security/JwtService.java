package com.studioflow.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final long expirationMinutes;
    private final Key signingKey;

    public JwtService(
        @Value("${studioflow.security.jwt.secret}") String secret,
        @Value("${studioflow.security.jwt.expiration-minutes}") long expirationMinutes
    ) {
        this.expirationMinutes = expirationMinutes;
        this.signingKey = Keys.hmacShaKeyFor(normalizeSecret(secret));
    }

    public String generateToken(StudioFlowUserPrincipal principal) {
        Instant now = Instant.now();

        return Jwts.builder()
            .subject(principal.getUsername())
            .claim("role", principal.getRole().name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
            .signWith(signingKey)
            .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, StudioFlowUserPrincipal principal) {
        Claims claims = parseClaims(token);
        return principal.getUsername().equalsIgnoreCase(claims.getSubject())
            && claims.getExpiration().after(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith((javax.crypto.SecretKey) signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private byte[] normalizeSecret(String secret) {
        String trimmed = secret.trim();

        try {
            byte[] decoded = Decoders.BASE64.decode(trimmed);
            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (RuntimeException ignored) {
            // Fallback to raw bytes below.
        }

        byte[] raw = trimmed.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 32) {
            return raw;
        }

        return (trimmed + "-studioflow-jwt-padding-2026").getBytes(StandardCharsets.UTF_8);
    }
}
