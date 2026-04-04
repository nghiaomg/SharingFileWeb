package com.sharingfileweb.exception;

/**
 * 403 Forbidden — ShareLink yêu cầu mật khẩu.
 */
public class ShareLinkRequiresPasswordException extends RuntimeException {
    public ShareLinkRequiresPasswordException(String message) {
        super(message);
    }
}
