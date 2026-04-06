package com.sharingfileweb.payload.response;

import java.time.LocalDate;

public class DashboardChartDTO {
    private String date; // format YYYY-MM-DD
    private long visits;
    private long uploadedFiles;
    private long uploadedSize;
    private long newUsers;

    public DashboardChartDTO(String date, long visits, long uploadedFiles, long uploadedSize, long newUsers) {
        this.date = date;
        this.visits = visits;
        this.uploadedFiles = uploadedFiles;
        this.uploadedSize = uploadedSize;
        this.newUsers = newUsers;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getVisits() {
        return visits;
    }

    public void setVisits(long visits) {
        this.visits = visits;
    }

    public long getUploadedFiles() {
        return uploadedFiles;
    }

    public void setUploadedFiles(long uploadedFiles) {
        this.uploadedFiles = uploadedFiles;
    }

    public long getUploadedSize() {
        return uploadedSize;
    }

    public void setUploadedSize(long uploadedSize) {
        this.uploadedSize = uploadedSize;
    }

    public long getNewUsers() {
        return newUsers;
    }

    public void setNewUsers(long newUsers) {
        this.newUsers = newUsers;
    }
}
