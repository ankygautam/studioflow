package com.studioflow.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
        ResourceNotFoundException exception,
        HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
        BadRequestException exception,
        HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        MethodArgumentNotValidException exception,
        HttpServletRequest request
    ) {
        String message = exception.getBindingResult()
            .getFieldErrors()
            .stream()
            .findFirst()
            .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
            .orElse("Validation failed");

        return buildResponse(HttpStatus.BAD_REQUEST, message, request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
        AuthenticationException exception,
        HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.UNAUTHORIZED, exception.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
        AccessDeniedException exception,
        HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied", request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResource(
        NoResourceFoundException exception,
        HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.NOT_FOUND, "Resource not found", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
        Exception exception,
        HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", request);
    }

    private ResponseEntity<ErrorResponse> buildResponse(
        HttpStatus status,
        String message,
        HttpServletRequest request
    ) {
        ErrorResponse response = new ErrorResponse(
            Instant.now(),
            status.value(),
            status.getReasonPhrase(),
            message,
            request.getRequestURI()
        );

        return ResponseEntity.status(status).body(response);
    }

    private record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
    ) {
    }
}
