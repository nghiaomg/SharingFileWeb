package com.sharingfileweb.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sharingfileweb.models.SubscriptionPlan;

@Repository
public interface SubscriptionPlanRepository extends MongoRepository<SubscriptionPlan, String> {

    Optional<SubscriptionPlan> findByName(String name);

    List<SubscriptionPlan> findByActiveTrueOrderBySortOrderAsc();

    List<SubscriptionPlan> findByActiveTrueAndIsDeletedFalseOrderBySortOrderAsc();

    List<SubscriptionPlan> findAllByOrderBySortOrderAsc();

    boolean existsByName(String name);
}
