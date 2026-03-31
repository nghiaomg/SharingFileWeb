package com.sharingfileweb.controllers.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.models.PaymentOrder;
import com.sharingfileweb.payload.response.OrderStatsResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.services.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/orders")
@Tag(name = "Admin Orders", description = "Quản lý đơn hàng dành cho Admin")
public class OrderAdminController {

    @Autowired
    private PaymentService paymentService;

    @Operation(summary = "Lấy danh sách đơn hàng có phân trang")
    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userId) {
        try {
            Page<PaymentOrder> ordersPage = paymentService.getAllOrders(page, size, status, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orders", ordersPage.getContent());
            response.put("currentPage", ordersPage.getNumber());
            response.put("totalItems", ordersPage.getTotalElements());
            response.put("totalPages", ordersPage.getTotalPages());
            
            return ResponseEntity.ok(StandardResponse.success("Lấy danh sách đơn hàng thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Xem thống kê đơn hàng")
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderStats() {
        try {
            OrderStatsResponse stats = paymentService.getOrderStats();
            return ResponseEntity.ok(StandardResponse.success("Lấy thống kê thành công", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Xem chi tiết 1 đơn hàng")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        try {
            return paymentService.getOrderById(id)
                .map(order -> ResponseEntity.ok(StandardResponse.success("Chi tiết đơn hàng", order)))
                .orElse(ResponseEntity.badRequest().body(StandardResponse.error("Không tìm thấy đơn hàng", null)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Sửa trạng thái đơn hàng (Duyệt/Hủy thủ công)")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            if (status == null || status.trim().isEmpty()) {
                throw new RuntimeException("Status is required");
            }
            PaymentOrder updatedOrder = paymentService.updateOrderStatus(id, status);
            return ResponseEntity.ok(StandardResponse.success("Cập nhật trạng thái thành công", updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }
}
