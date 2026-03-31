package com.sharingfileweb.security.services;

import java.time.Instant;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.sharingfileweb.models.PaymentOrder;
import com.sharingfileweb.payload.response.SepayTransaction;
import com.sharingfileweb.repository.PaymentOrderRepository;
import com.sharingfileweb.services.PaymentService;
import com.sharingfileweb.services.SepayTransactionService;

@Service
public class PaymentVerificationScheduler {

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private SepayTransactionService sepayTransactionService;

    // Chạy cronjob mỗi 30s để kiểm tra pending order có thanh toán hay chưa
    @Scheduled(fixedRate = 30000)
    public void verifyPendingPayments() {
        List<PaymentOrder> pendingOrders = paymentOrderRepository.findByStatus("PENDING");
        if (pendingOrders.isEmpty()) return;

        // Xóa / expire đơn
        boolean hasLiveOrders = false;
        Instant now = Instant.now();
        for (PaymentOrder order : pendingOrders) {
            if (order.getExpiredAt().isBefore(now)) {
                order.setStatus("EXPIRED");
                paymentOrderRepository.save(order);
            } else {
                hasLiveOrders = true;
            }
        }

        if (!hasLiveOrders) return; // Không có đơn nào còn hạn

        // Fetch danh sách 10 hoặc 20 giao dịch gần nhất
        List<SepayTransaction> recentTransactions = sepayTransactionService.fetchRecentTransactions(15);
        if (recentTransactions == null || recentTransactions.isEmpty()) return;

        // Map live orders update DB trước thì gọi lại lấy đơn
        List<PaymentOrder> liveOrders = paymentOrderRepository.findByStatus("PENDING");

        for (PaymentOrder order : liveOrders) {
            // Regex match chuỗi chứa: FL [khoảng trắng/nhiều khoảng trắng] CODE
            String regex = ".*FL\\s+" + order.getOrderCode() + ".*";
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);

            for (SepayTransaction txn : recentTransactions) {
                if (txn.getTransactionContent() == null) continue;

                Matcher matcher = pattern.matcher(txn.getTransactionContent());
                if (matcher.matches()) {
                    long amountIn = 0;
                    try {
                        amountIn = (long) Double.parseDouble(txn.getAmountIn());
                    } catch (Exception e) {}

                    // Chấp nhận nếu số tiền CK >= tiền giỏ hàng (chống thiếu tiền)
                    if (amountIn >= order.getAmount()) {
                        System.out.println("[Payment] Found matching transaction for order: " + order.getOrderCode());
                        paymentService.confirmOrder(order.getOrderCode(), txn.getId());
                        break; 
                    } else if (amountIn > 0) {
                        System.out.println("[Payment - Warning] Matched content for " + order.getOrderCode() + " but insufficient amount received: " + amountIn);
                    }
                }
            }
        }

    }

}
