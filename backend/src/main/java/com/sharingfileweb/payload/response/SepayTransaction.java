package com.sharingfileweb.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SepayTransaction {
    private String id;
    
    @JsonProperty("bank_brand_name")
    private String bankBrandName;
    
    @JsonProperty("account_number")
    private String accountNumber;
    
    @JsonProperty("transaction_date")
    private String transactionDate;
    
    @JsonProperty("amount_in")
    private String amountIn;
    
    @JsonProperty("transaction_content")
    private String transactionContent;
    
    @JsonProperty("reference_number")
    private String referenceNumber;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBankBrandName() {
        return bankBrandName;
    }

    public void setBankBrandName(String bankBrandName) {
        this.bankBrandName = bankBrandName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getAmountIn() {
        return amountIn;
    }

    public void setAmountIn(String amountIn) {
        this.amountIn = amountIn;
    }

    public String getTransactionContent() {
        return transactionContent;
    }

    public void setTransactionContent(String transactionContent) {
        this.transactionContent = transactionContent;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
}
