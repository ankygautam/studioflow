package com.studioflow.security;

import com.studioflow.entity.User;
import com.studioflow.exception.ResourceNotFoundException;
import com.studioflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudioFlowUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(username.trim().toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return new StudioFlowUserPrincipal(user);
    }

    public StudioFlowUserPrincipal loadPrincipalByEmail(String email) {
        return (StudioFlowUserPrincipal) loadUserByUsername(email);
    }
}
