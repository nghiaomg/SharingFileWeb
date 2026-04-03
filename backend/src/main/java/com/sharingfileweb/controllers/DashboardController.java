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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.CrossOrigin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Các API thống kê, phân tích dữ liệu cho Dashboard.")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Operation(summary = "Thống kê dung lượng File", description = "Thống kê dung lượng đã dùng theo từng loại File (Image, Video, Document...).")
    @GetMapping("/categories")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCategories() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        List<StorageCategoryDTO> categories = dashboardService.getDashboardCategories(userDetails.getId(), isAdmin);
        return ResponseEntity.ok(StandardResponse.success("Fetched dashboard categories successfully", categories));
    }

    @Operation(summary = "Tệp hoạt động gần đây", description = "Lấy danh sách các tệp được tải lên/truy cập gần đây nhất.")
    @GetMapping("/recent-files")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRecentFiles() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        List<RecentFileDTO> recentFiles = dashboardService.getDashboardRecentFiles(userDetails.getId(), isAdmin);
        return ResponseEntity.ok(StandardResponse.success("Fetched recent files successfully", recentFiles));
    }

    @Operation(summary = "Biểu đồ phân tích Dashboard", description = "Dữ liệu phục vụ việc vẽ biểu đồ theo 7/14/30 ngày (lượt truy cập và tải tệp).")
    @GetMapping("/charts")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardCharts(@RequestParam(defaultValue = "7") int days) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        List<com.sharingfileweb.payload.response.DashboardChartDTO> chartsData = dashboardService.getDashboardCharts(days, userDetails.getId(), isAdmin);
        
        return ResponseEntity.ok(StandardResponse.success("Fetched dashboard charts successfully", chartsData));
    }
}
