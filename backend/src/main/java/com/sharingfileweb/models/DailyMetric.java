package com.sharingfileweb.models;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "daily_metrics")
public class DailyMetric {
    @Id
    private String id;
    
    private LocalDate date;
    
    private long visitCount;

    public DailyMetric() {
    }

    public DailyMetric(LocalDate date, long visitCount) {
        this.date = date;
        this.visitCount = visitCount;
    }

    public String getId() {
        return id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getVisitCount() {
        return visitCount;
    }

    public void setVisitCount(long visitCount) {
        this.visitCount = visitCount;
    }
}
