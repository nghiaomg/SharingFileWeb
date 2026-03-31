package com.sharingfileweb.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sharingfileweb.models.PaymentOrder;

public interface PaymentOrderRepository extends MongoRepository<PaymentOrder, String> {
    Optional<PaymentOrder> findByUserIdAndStatus(String userId, String status);
    List<PaymentOrder> findByStatus(String status);
    Optional<PaymentOrder> findByOrderCode(String orderCode);
    boolean existsByOrderCode(String orderCode);
    boolean existsByTransactionId(String transactionId);
}
