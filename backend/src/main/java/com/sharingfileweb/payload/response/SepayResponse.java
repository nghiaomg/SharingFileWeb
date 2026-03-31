package com.sharingfileweb.payload.response;

import java.util.List;

public class SepayResponse {
    private int status;
    private String error;
    private List<SepayTransaction> transactions;

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public List<SepayTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<SepayTransaction> transactions) {
        this.transactions = transactions;
    }
}
