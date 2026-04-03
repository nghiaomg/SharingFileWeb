package com.sharingfileweb.repository;

import com.sharingfileweb.models.DailyMetric;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface DailyMetricRepository extends MongoRepository<DailyMetric, String> {
    Optional<DailyMetric> findByDate(LocalDate date);
    
    List<DailyMetric> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
}
