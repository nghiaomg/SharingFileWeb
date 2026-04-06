package com.sharingfileweb.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.SubscriptionPlan;
import com.sharingfileweb.payload.request.CreateSubscriptionPlanRequest;
import com.sharingfileweb.payload.request.UpdateSubscriptionPlanRequest;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.services.SubscriptionPlanService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/subscription")
@Tag(name = "Subscription", description = "Quản lý gói cước - User & Admin.")
public class SubscriptionController {

    @Autowired
    private SubscriptionPlanService subscriptionPlanService;

    // ===================== USER ENDPOINTS =====================

    @Operation(summary = "Lấy danh sách gói cước khả dụng",
               description = "Trả về các gói cước đang active, sắp xếp theo sortOrder.")
    @GetMapping("/plans")
    public ResponseEntity<?> getActivePlans() {
        List<SubscriptionPlan> plans = subscriptionPlanService.getActivePlans();
        return ResponseEntity.ok(StandardResponse.success("Fetched active plans", plans));
    }

    @Operation(summary = "Nâng cấp gói cước",
               description = "Nâng cấp gói cước của user hiện tại lên gói được chỉ định (yêu cầu thanh toán trước).")
    @PostMapping("/upgrade")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> upgradePlan(
            @RequestParam(defaultValue = "PRO") String planName) {
        try {
            subscriptionPlanService.upgradePlan(planName);
            return ResponseEntity.ok(StandardResponse.success("Upgraded to " + planName + " successfully!", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    // ===================== ADMIN CRUD ENDPOINTS =====================

    @Operation(summary = "Lấy tất cả gói cước (Admin)",
               description = "Lấy danh sách phân trang tất cả gói cước (kể cả inactive).")
    @GetMapping("/admin/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<SubscriptionPlan> plans = subscriptionPlanService.getAllPlans(page, size, null);
        return ResponseEntity.ok(StandardResponse.success("Fetched all plans", plans));
    }

    @Operation(summary = "Lấy chi tiết gói cước (Admin)",
               description = "Lấy thông tin chi tiết một gói cước theo ID.")
    @GetMapping("/admin/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPlanById(
            @Parameter(description = "ID gói cước") @PathVariable String id) {
        return subscriptionPlanService.getPlanById(id)
                .map(plan -> ResponseEntity.ok(StandardResponse.success("Plan found", plan)))
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Tạo gói cước mới (Admin)",
               description = "Tạo một gói cước mới. Name phải là DUY NHẤT (không trùng).")
    @PostMapping("/admin/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPlan(
            @Valid @RequestBody CreateSubscriptionPlanRequest request) {
        try {
            SubscriptionPlan created = subscriptionPlanService.createPlan(request);
            return ResponseEntity.ok(StandardResponse.success("Plan created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Cập nhật gói cước (Admin)",
               description = "Cập nhật thông tin gói cước. Chỉ trường được truyền mới được cập nhật.")
    @PutMapping("/admin/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePlan(
            @Parameter(description = "ID gói cước") @PathVariable String id,
            @Valid @RequestBody UpdateSubscriptionPlanRequest request) {
        try {
            SubscriptionPlan updated = subscriptionPlanService.updatePlan(id, request);
            return ResponseEntity.ok(StandardResponse.success("Plan updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Xóa gói cước (Admin)",
               description = "Xóa hoàn toàn một gói cước. CẢNH BÁO: User đang dùng gói này sẽ không bị ảnh hưởng tự động.")
    @DeleteMapping("/admin/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePlan(
            @Parameter(description = "ID gói cước cần xóa") @PathVariable String id) {
        try {
            subscriptionPlanService.deletePlan(id);
            return ResponseEntity.ok(StandardResponse.success("Plan deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Khởi tạo gói cước mặc định (Admin)",
               description = "Tạo 3 gói mặc định: BASIC, PRO, PREMIUM. Chỉ chạy khi chưa có gói nào trong hệ thống.")
    @PostMapping("/admin/plans/init")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> initDefaultPlans() {
        subscriptionPlanService.initializeDefaultPlans();
        List<SubscriptionPlan> plans = subscriptionPlanService.getAllPlansList();
        return ResponseEntity.ok(StandardResponse.success("Default plans initialized", plans));
    }
}
