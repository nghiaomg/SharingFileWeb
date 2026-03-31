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
        if ("PRO".equalsIgnoreCase(planName)) return 10000;
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
}
