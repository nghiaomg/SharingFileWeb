package com.sharingfileweb.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.UpdateProfileRequest;
import com.sharingfileweb.payload.response.UserProfileResponse;
import com.sharingfileweb.repository.FileRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class UserService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    FileRepository fileRepository;

    private UserDetailsImpl getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }

    public UserProfileResponse getCurrentUserProfile() {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new UserProfileResponse(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                userDetails.getSubscriptionPlan(),
                userDetails.getMaxStorage(),
                userDetails.getMaxFileSize()
        );
    }

    public void updateProfile(UpdateProfileRequest request) {
        UserDetailsImpl userDetails = getCurrentUserDetails();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);
    }

    public Map<String, Object> getStorageUsage() {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        Long totalBytes = fileRepository.sumSizeByOwnerId(userDetails.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("usedStorage", totalBytes != null ? totalBytes : 0L);

        return response;
    }
}
