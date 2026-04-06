package com.sharingfileweb.services;

import java.time.Instant;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.PaymentOrder;
import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.response.PaymentOrderResponse;
import com.sharingfileweb.repository.PaymentOrderRepository;
import com.sharingfileweb.repository.UserRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${sepay.account-number}")
    private String sepayAccount;

    @Value("${sepay.bank-name}")
    private String sepayBankName;

    // Mock pricing cho gói dịch vụ
    private long getAmountByPlan(String planName) {
        if ("PRO".equalsIgnoreCase(planName)) return 9000;
        return 0; // Gói không hợp lệ
    }

    public PaymentOrderResponse createPaymentOrder(String userId, String planName) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if ("PRO".equalsIgnoreCase(user.getSubscriptionPlan())) {
            throw new RuntimeException("Bạn đã là thành viên PRO");
        }

        // Kiểm tra đơn hàng đang PENDING
        Optional<PaymentOrder> existingOpt = paymentOrderRepository.findByUserIdAndStatus(userId, "PENDING");
        if (existingOpt.isPresent()) {
            PaymentOrder existing = existingOpt.get();
            if (existing.getExpiredAt().isBefore(Instant.now())) {
                existing.setStatus("EXPIRED");
                paymentOrderRepository.save(existing);
            } else {
                return new PaymentOrderResponse(existing, generateQrUrl(existing.getOrderCode(), existing.getAmount()));
            }
        }
        
        long amount = getAmountByPlan(planName);
        if (amount <= 0) {
            throw new RuntimeException("Gói cước không hợp lệ");
        }

        String orderCode = generateUniqueOrderCode();
        PaymentOrder newOrder = new PaymentOrder(userId, orderCode, planName, amount);
        paymentOrderRepository.save(newOrder);

        return new PaymentOrderResponse(newOrder, generateQrUrl(orderCode, amount));
    }

    public Optional<PaymentOrderResponse> getActiveOrder(String userId) {
        return paymentOrderRepository.findByUserIdAndStatus(userId, "PENDING")
                .map(order -> {
                    if (order.getExpiredAt().isBefore(Instant.now())) {
                        order.setStatus("EXPIRED");
                        paymentOrderRepository.save(order);
                        return null; // Return empty later logic
                    }
                    return new PaymentOrderResponse(order, generateQrUrl(order.getOrderCode(), order.getAmount()));
                });
    }

    public void cancelActiveOrder(String userId) {
        Optional<PaymentOrder> existingOpt = paymentOrderRepository.findByUserIdAndStatus(userId, "PENDING");
        if (existingOpt.isPresent()) {
            PaymentOrder existing = existingOpt.get();
            existing.setStatus("CANCELLED");
            paymentOrderRepository.save(existing);
        } else {
            throw new RuntimeException("Không có đơn hàng nào đang chờ thanh toán");
        }
    }

    public java.util.List<PaymentOrderResponse> getPaymentHistory(String userId) {
        return paymentOrderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(order -> new PaymentOrderResponse(order, generateQrUrl(order.getOrderCode(), order.getAmount())))
            .collect(java.util.stream.Collectors.toList());
    }

    public synchronized void confirmOrder(String orderCode, String transactionId) {
        PaymentOrder order = paymentOrderRepository.findByOrderCode(orderCode).orElse(null);
        if (order == null) return;
        
        if (!"PENDING".equals(order.getStatus())) return; // Tránh race condition
        
        // Tránh lưu duplicate
        if (paymentOrderRepository.existsByTransactionId(transactionId)) {
            return; 
        }

        // Cập nhật đơn hàng
        order.setStatus("CONFIRMED");
        order.setTransactionId(transactionId);
        order.setConfirmedAt(Instant.now());
        paymentOrderRepository.save(order);

        // Nâng cấp User
        User user = userRepository.findById(order.getUserId()).orElse(null);
        if (user != null) {
            user.setSubscriptionPlan(order.getPlanName());
            user.setMaxStorage(2000L * 1024 * 1024 * 1024); // 2TB TODO: Replace with plan config if app extends
            user.setMaxFileSize(Long.MAX_VALUE);
            userRepository.save(user);
        }
    }

    private String generateQrUrl(String orderCode, long amount) {
        // Encode khoảng trắng thành %20 cho URL (FL%20{CODE})
        return String.format("https://qr.sepay.vn/img?bank=%s&acc=%s&template=compact&amount=%d&des=FL%%20%s",
                sepayBankName, sepayAccount, amount, orderCode);
    }

    private String generateUniqueOrderCode() {
        String code;
        do {
            code = generateRandomString(6);
        } while (paymentOrderRepository.existsByOrderCode(code));
        return code;
    }

    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random rnd = new Random();
        for (int i=0; i<length; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    // --- ADMIN METHODS ---

    public org.springframework.data.domain.Page<PaymentOrder> getAllOrders(
            int page, int size, String status, String userId) {
        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        
        if (status != null && !status.isEmpty() && userId != null && !userId.isEmpty()) {
            return paymentOrderRepository.findByUserIdAndStatusPage(userId, status, pageable);
        } else if (status != null && !status.isEmpty()) {
            return paymentOrderRepository.findByStatus(status, pageable);
        } else if (userId != null && !userId.isEmpty()) {
            return paymentOrderRepository.findByUserId(userId, pageable);
        } else {
            return paymentOrderRepository.findAll(pageable);
        }
    }

    public Optional<PaymentOrder> getOrderById(String id) {
        return paymentOrderRepository.findById(id);
    }

    public synchronized PaymentOrder updateOrderStatus(String id, String newStatus) {
        PaymentOrder order = paymentOrderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
            
        // Nếu chuyển sang CONFIRMED thủ công và đang là PENDING, giống logic webhook
        if ("CONFIRMED".equals(newStatus) && "PENDING".equals(order.getStatus())) {
            this.confirmOrder(order.getOrderCode(), "ADMIN-MANUAL-" + Instant.now().toEpochMilli());
            return paymentOrderRepository.findById(id).get();
        }
        
        // Nếu trạng thái khác (hủy đơn, expired thủ công...)
        order.setStatus(newStatus);
        if ("CONFIRMED".equals(newStatus)) {
            order.setConfirmedAt(Instant.now());
            // Upgrade user manually? Yes
            User user = userRepository.findById(order.getUserId()).orElse(null);
            if (user != null && "PENDING".equals(order.getStatus())) { // double check
                user.setSubscriptionPlan(order.getPlanName());
                user.setMaxStorage(2000L * 1024 * 1024 * 1024);
                user.setMaxFileSize(Long.MAX_VALUE);
                userRepository.save(user);
            }
        }
        return paymentOrderRepository.save(order);
    }

    public com.sharingfileweb.payload.response.OrderStatsResponse getOrderStats() {
        java.util.List<PaymentOrder> allOrders = paymentOrderRepository.findAll();
        long totalOrders = allOrders.size();
        long pending = 0;
        long confirmed = 0;
        long expired = 0;
        long revenue = 0;
        
        for (PaymentOrder order : allOrders) {
            String status = order.getStatus();
            if ("PENDING".equals(status)) {
                pending++;
            } else if ("CONFIRMED".equals(status)) {
                confirmed++;
                revenue += order.getAmount();
            } else if ("EXPIRED".equals(status)) {
                expired++;
            }
        }
        
        return new com.sharingfileweb.payload.response.OrderStatsResponse(
            revenue, totalOrders, pending, confirmed, expired);
    }
}
