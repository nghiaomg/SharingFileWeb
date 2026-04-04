package com.sharingfileweb.exception;

import com.sharingfileweb.payload.response.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralized exception handler — maps custom exceptions to HTTP responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FileAccessDeniedException.class)
    public ResponseEntity<StandardResponse> handleFileAccessDenied(FileAccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(StandardResponse.error("ACCESS_DENIED", ex.getMessage()));
    }

    @ExceptionHandler(ShareLinkExpiredException.class)
    public ResponseEntity<StandardResponse> handleShareLinkExpired(ShareLinkExpiredException ex) {
        return ResponseEntity.status(HttpStatus.GONE)
                .body(StandardResponse.error("SHARE_LINK_EXPIRED", ex.getMessage()));
    }

    @ExceptionHandler(ShareLinkMaxViewsExceededException.class)
    public ResponseEntity<StandardResponse> handleMaxViewsExceeded(ShareLinkMaxViewsExceededException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(StandardResponse.error("SHARE_LINK_MAX_VIEWS_EXCEEDED", ex.getMessage()));
    }

    @ExceptionHandler(ShareLinkRequiresPasswordException.class)
    public ResponseEntity<StandardResponse> handleRequiresPassword(ShareLinkRequiresPasswordException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(StandardResponse.error("REQUIRES_PASSWORD", ex.getMessage()));
    }

    @ExceptionHandler(ShareLinkRevokedException.class)
    public ResponseEntity<StandardResponse> handleShareLinkRevoked(ShareLinkRevokedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(StandardResponse.error("SHARE_LINK_REVOKED", ex.getMessage()));
    }

    @ExceptionHandler(ShareLinkViewOnlyException.class)
    public ResponseEntity<StandardResponse> handleViewOnly(ShareLinkViewOnlyException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(StandardResponse.error("VIEW_ONLY_LINK", ex.getMessage()));
    }
}
