package com.sharingfileweb.exception;

/**
 * 410 Gone — ShareLink đã hết hạn.
 */
public class ShareLinkExpiredException extends RuntimeException {
    public ShareLinkExpiredException(String message) {
        super(message);
    }
}
