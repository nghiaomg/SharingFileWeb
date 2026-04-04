package com.sharingfileweb.exception;

/**
 * 403 Forbidden — Người dùng không có quyền truy cập file/folder.
 */
public class FileAccessDeniedException extends RuntimeException {
    public FileAccessDeniedException(String message) {
        super(message);
    }
}
