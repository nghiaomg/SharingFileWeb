package com.sharingfileweb.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.User;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class SubscriptionPlanService {

    @Autowired
    UserRepository userRepository;

    public void upgradePlan() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Mock payment process: immediately upgrade to PRO
        user.setSubscriptionPlan("PRO");
        user.setMaxStorage(2000L * 1024 * 1024 * 1024); // 2TB = 2000 GB
        user.setMaxFileSize(Long.MAX_VALUE); // Unlimited upload size

        userRepository.save(user);
    }
}
