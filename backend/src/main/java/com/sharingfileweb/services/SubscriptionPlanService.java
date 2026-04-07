package com.sharingfileweb.services;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.SubscriptionPlan;
import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.CreateSubscriptionPlanRequest;
import com.sharingfileweb.payload.request.UpdateSubscriptionPlanRequest;
import com.sharingfileweb.repository.SubscriptionPlanRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class SubscriptionPlanService {

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private UserRepository userRepository;

    // === USER METHODS ===

    public void upgradePlan(String planName) {
        UserDetailsImpl userDetails = getCurrentUserDetails();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SubscriptionPlan plan = subscriptionPlanRepository.findByName(planName)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (!plan.isActive() || plan.isDeleted()) {
            throw new RuntimeException("Gói cước không còn khả dụng hoặc đã bị xoá");
        }

        user.setSubscriptionPlan(plan.getName());
        user.setMaxStorage(plan.getMaxStorage());
        user.setMaxFileSize(plan.getMaxFileSize());
        userRepository.save(user);
    }

    public List<SubscriptionPlan> getActivePlans() {
        return subscriptionPlanRepository.findByActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();
    }

    // === ADMIN CRUD ===

    public Page<SubscriptionPlan> getAllPlans(int page, int size, Boolean active) {
        Sort sort = Sort.by(Sort.Direction.ASC, "sortOrder");
        PageRequest pageable = PageRequest.of(page, size, sort);

        if (active != null) {
            return subscriptionPlanRepository.findAll(pageable);
        }
        return subscriptionPlanRepository.findAll(pageable);
    }

    public List<SubscriptionPlan> getAllPlansList() {
        return subscriptionPlanRepository.findAllByOrderBySortOrderAsc();
    }

    public Optional<SubscriptionPlan> getPlanById(String id) {
        return subscriptionPlanRepository.findById(id);
    }

    public SubscriptionPlan createPlan(CreateSubscriptionPlanRequest request) {
        if (subscriptionPlanRepository.existsByName(request.getName())) {
            throw new RuntimeException("Plan with this name already exists");
        }

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(request.getName().toUpperCase());
        plan.setDisplayName(request.getDisplayName());
        plan.setDescription(request.getDescription());
        plan.setMaxStorage(request.getMaxStorage());
        plan.setMaxFileSize(request.getMaxFileSize());
        plan.setPrice(request.getPrice());
        plan.setDurationDays(request.getDurationDays());
        plan.setSortOrder(request.getSortOrder());
        plan.setActive(true);

        return subscriptionPlanRepository.save(plan);
    }

    public SubscriptionPlan updatePlan(String id, UpdateSubscriptionPlanRequest request) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (request.getDisplayName() != null) {
            plan.setDisplayName(request.getDisplayName());
        }
        if (request.getDescription() != null) {
            plan.setDescription(request.getDescription());
        }
        if (request.getMaxStorage() != null) {
            plan.setMaxStorage(request.getMaxStorage());
        }
        if (request.getMaxFileSize() != null) {
            plan.setMaxFileSize(request.getMaxFileSize());
        }
        if (request.getPrice() != null) {
            plan.setPrice(request.getPrice());
        }
        if (request.getDurationDays() != null) {
            plan.setDurationDays(request.getDurationDays());
        }
        if (request.getActive() != null) {
            plan.setActive(request.getActive());
        }
        if (request.getSortOrder() != null) {
            plan.setSortOrder(request.getSortOrder());
        }

        plan.setUpdatedAt(Instant.now());
        return subscriptionPlanRepository.save(plan);
    }

    public void deletePlan(String id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setDeleted(true);
        subscriptionPlanRepository.save(plan);
    }

    public void restorePlan(String id) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setDeleted(false);
        subscriptionPlanRepository.save(plan);
    }

    public void initializeDefaultPlans() {
        if (subscriptionPlanRepository.count() == 0) {
            createDefaultPlan("BASIC", "Gói Cơ Bản",
                    "Miễn phí - Dung lượng giới hạn", 5L * 1024 * 1024 * 1024,
                    1024L * 1024 * 1024, 0, 30, 0);

            createDefaultPlan("PRO", "Gói PRO",
                    "Nâng cao - 2TB dung lượng, upload file lớn",
                    2L * 1024 * 1024 * 1024 * 1024, Long.MAX_VALUE, 9000, 30, 1);

            createDefaultPlan("PREMIUM", "Gói PREMIUM",
                    "Không giới hạn dung lượng và kích thước file",
                    Long.MAX_VALUE, Long.MAX_VALUE, 199000, 30, 2);
        }
    }

    private void createDefaultPlan(String name, String displayName, String desc,
            long storage, long fileSize, long price, int duration, int order) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(name);
        plan.setDisplayName(displayName);
        plan.setDescription(desc);
        plan.setMaxStorage(storage);
        plan.setMaxFileSize(fileSize);
        plan.setPrice(price);
        plan.setDurationDays(duration);
        plan.setSortOrder(order);
        plan.setActive(true);
        subscriptionPlanRepository.save(plan);
    }

    // === STATS ===

    public long countByActive(boolean active) {
        return subscriptionPlanRepository.findAll().stream()
                .filter(p -> p.isActive() == active)
                .count();
    }

    // === HELPERS ===

    private UserDetailsImpl getCurrentUserDetails() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
