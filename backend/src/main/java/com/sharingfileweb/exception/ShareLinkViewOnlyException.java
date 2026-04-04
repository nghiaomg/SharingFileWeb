package com.sharingfileweb.exception;

/**
 * 403 Forbidden — ShareLink chỉ cho phép xem (VIEW), không cho tải xuống.
 */
public class ShareLinkViewOnlyException extends RuntimeException {
    public ShareLinkViewOnlyException(String message) {
        super(message);
    }
}
