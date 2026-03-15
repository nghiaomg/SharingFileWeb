package com.sharingfileweb.payload.response;

import java.util.List;

public class DashboardOverviewDTO {
    private List<StorageCategoryDTO> categories;
    private List<RecentFileDTO> recentFiles;

    public DashboardOverviewDTO() {}

    public DashboardOverviewDTO(List<StorageCategoryDTO> categories, List<RecentFileDTO> recentFiles) {
        this.categories = categories;
        this.recentFiles = recentFiles;
    }

    public List<StorageCategoryDTO> getCategories() {
        return categories;
    }

    public void setCategories(List<StorageCategoryDTO> categories) {
        this.categories = categories;
    }

    public List<RecentFileDTO> getRecentFiles() {
        return recentFiles;
    }

    public void setRecentFiles(List<RecentFileDTO> recentFiles) {
        this.recentFiles = recentFiles;
    }
}
