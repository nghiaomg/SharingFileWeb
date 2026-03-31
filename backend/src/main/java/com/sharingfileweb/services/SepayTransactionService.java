package com.sharingfileweb.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.sharingfileweb.payload.response.SepayResponse;
import com.sharingfileweb.payload.response.SepayTransaction;

import java.util.Collections;
import java.util.List;

@Service
public class SepayTransactionService {

    @Value("${sepay.token}")
    private String sepayToken;

    @Value("${sepay.account-number}")
    private String sepayAccountNumber;

    // Fetch the 10 most recent transactions from specific account
    public List<SepayTransaction> fetchRecentTransactions(int limit) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://my.sepay.vn/userapi/transactions/list?account_number=" + sepayAccountNumber + "&limit=" + limit;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + sepayToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<SepayResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, SepayResponse.class);
            
            if (response.getBody() != null && response.getBody().getStatus() == 200) {
                return response.getBody().getTransactions();
            }
        } catch (Exception e) {
            System.err.println("Error fetching transactions from SePay: " + e.getMessage());
        }
        
        return Collections.emptyList();
    }
}
