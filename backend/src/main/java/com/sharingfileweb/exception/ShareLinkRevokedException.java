package com.sharingfileweb.exception;

/**
 * 403 Forbidden — ShareLink đã bị thu hồi.
 */
public class ShareLinkRevokedException extends RuntimeException {
    public ShareLinkRevokedException(String message) {
        super(message);
    }
}
