package com.studioflow.security;

import com.studioflow.entity.User;
import com.studioflow.enums.UserRole;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class StudioFlowUserPrincipal implements UserDetails {

    private final User user;

    public StudioFlowUserPrincipal(User user) {
        this.user = user;
    }

    public UUID getId() {
        return user.getId();
    }

    public String getFullName() {
        return user.getFullName();
    }

    public UserRole getRole() {
        return user.getRole();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(user.getIsActive());
    }
}
