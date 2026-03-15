package com.sharingfileweb.payload.response;

public class StorageCategoryDTO {
    private String title;
    private long files;
    private long size;

    public StorageCategoryDTO() {}

    public StorageCategoryDTO(String title, long files, long size) {
        this.title = title;
        this.files = files;
        this.size = size;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getFiles() {
        return files;
    }

    public void setFiles(long files) {
        this.files = files;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }
}
