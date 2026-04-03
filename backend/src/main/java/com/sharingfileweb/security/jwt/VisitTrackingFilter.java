package com.sharingfileweb.security.jwt;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.sharingfileweb.services.VisitTrackingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class VisitTrackingFilter extends OncePerRequestFilter {

    @Autowired
    private VisitTrackingService visitTrackingService;

    // A simple in-memory set to prevent counting the same IP 100 times a second.
    // In production, this might be bounded by an eviction strategy.
    private final Set<String> trackedIpsToday = ConcurrentHashMap.newKeySet();
    private int currentDay = java.time.LocalDate.now().getDayOfYear();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Reset cache if the day changes
        int today = java.time.LocalDate.now().getDayOfYear();
        if (today != currentDay) {
            trackedIpsToday.clear();
            currentDay = today;
        }

        String ip = request.getRemoteAddr();
        
        // We only track requests to API endpoints to avoid static assets
        if (request.getRequestURI().startsWith("/api/")) {
            if (ip != null && !trackedIpsToday.contains(ip)) {
                trackedIpsToday.add(ip);
                try {
                    visitTrackingService.incrementVisit();
                } catch (Exception e) {
                    // ignore tracking errors silently
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
