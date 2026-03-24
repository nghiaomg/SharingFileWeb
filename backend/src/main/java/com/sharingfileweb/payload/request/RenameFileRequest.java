package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RenameFileRequest {
    @NotBlank(message = "Tên tệp không được để trống")
    @Size(max = 255, message = "Tên tệp quá dài")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
