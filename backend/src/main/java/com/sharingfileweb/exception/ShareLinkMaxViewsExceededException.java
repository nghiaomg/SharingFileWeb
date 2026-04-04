package com.sharingfileweb.exception;

/**
 * 403 Forbidden — ShareLink đã đạt số lượt truy cập tối đa.
 */
public class ShareLinkMaxViewsExceededException extends RuntimeException {
    public ShareLinkMaxViewsExceededException(String message) {
        super(message);
    }
}
