package com.sharingfileweb.services;

import com.sharingfileweb.models.DailyMetric;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class VisitTrackingService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public void incrementVisit() {
        LocalDate today = LocalDate.now();
        
        Query query = new Query(Criteria.where("date").is(today));
        Update update = new Update().inc("visitCount", 1);
        
        mongoTemplate.upsert(query, update, DailyMetric.class);
    }
}
