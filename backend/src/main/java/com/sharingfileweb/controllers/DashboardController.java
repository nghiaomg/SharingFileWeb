package com.sharingfileweb.controllers;

import com.sharingfileweb.payload.response.DashboardOverviewDTO;
import com.sharingfileweb.payload.response.RecentFileDTO;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.payload.response.StorageCategoryDTO;
import com.sharingfileweb.services.DashboardService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import com.sharingfileweb.security.services.UserDetailsImpl;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/categories")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCategories() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<StorageCategoryDTO> categories = dashboardService.getDashboardCategories(userDetails.getId());
        return ResponseEntity.ok(StandardResponse.success("Fetched dashboard categories successfully", categories));
    }

    @GetMapping("/recent-files")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRecentFiles() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<RecentFileDTO> recentFiles = dashboardService.getDashboardRecentFiles(userDetails.getId());
        return ResponseEntity.ok(StandardResponse.success("Fetched recent files successfully", recentFiles));
    }
}
