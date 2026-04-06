package com.sharingfileweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.sharingfileweb.payload.request.CreatePaymentRequest;
import com.sharingfileweb.payload.response.PaymentOrderResponse;
import com.sharingfileweb.payload.response.StandardResponse;
import com.sharingfileweb.security.services.UserDetailsImpl;
import com.sharingfileweb.services.PaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import java.util.Optional;


@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment", description = "Quản lý thanh toán tích hợp SePay")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Operation(summary = "Tạo đơn thanh toán mới", description = "Tạo đơn và trả về QR thanh toán. Nếu đã có đơn chờ, sẽ trả về đơn cũ.")
    @PostMapping("/create")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> createPaymentOrder(@Valid @RequestBody CreatePaymentRequest request) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            PaymentOrderResponse response = paymentService.createPaymentOrder(userDetails.getId(), request.getPlanName());
            return ResponseEntity.ok(StandardResponse.success("Tạo đơn thanh toán thành công", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Kiểm tra trạng thái đơn hàng", description = "Trả về đơn hàng đang PENDING hiện tại của user (nếu có)")
    @GetMapping("/status")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentStatus() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Optional<PaymentOrderResponse> optOrder = paymentService.getActiveOrder(userDetails.getId());
            
            if (optOrder.isPresent()) {
                return ResponseEntity.ok(StandardResponse.success("Lấy thông tin đơn hàng thành công", optOrder.get()));
            } else {
                return ResponseEntity.ok(StandardResponse.success("Bạn không có đơn thanh toán nào đang chờ", null));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Kiểm tra trạng thái đơn hàng theo mã", description = "Trả về thông tin đơn hàng cụ thể theo orderCode của user")
    @GetMapping("/status/{orderCode}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentStatusByCode(@PathVariable String orderCode) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Optional<PaymentOrderResponse> optOrder = paymentService.getOrderDetailsByCode(userDetails.getId(), orderCode);
            
            if (optOrder.isPresent()) {
                return ResponseEntity.ok(StandardResponse.success("Lấy thông tin đơn hàng thành công", optOrder.get()));
            } else {
                return ResponseEntity.ok(StandardResponse.success("Không tìm thấy đơn hàng", null));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Hủy đơn thanh toán", description = "Hủy đơn hàng PENDING hiện tại")
    @PostMapping("/cancel")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelPaymentOrder() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            paymentService.cancelActiveOrder(userDetails.getId());
            return ResponseEntity.ok(StandardResponse.success("Hủy đơn hàng thành công", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

    @Operation(summary = "Lấy lịch sử thanh toán", description = "Lấy toàn bộ danh sách đơn hàng của user")
    @GetMapping("/history")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentHistory() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            java.util.List<PaymentOrderResponse> history = paymentService.getPaymentHistory(userDetails.getId());
            return ResponseEntity.ok(StandardResponse.success("Lấy lịch sử thanh toán thành công", history));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(StandardResponse.error(e.getMessage(), null));
        }
    }

}
