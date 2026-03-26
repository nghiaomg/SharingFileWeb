package com.sharingfileweb.payload.request;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
  @NotBlank
  private String username;

  @NotBlank
  private String password;

  @NotBlank(message = "Captcha token is required")
  private String turnstileToken;

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getTurnstileToken() {
    return turnstileToken;
  }

  public void setTurnstileToken(String turnstileToken) {
    this.turnstileToken = turnstileToken;
  }
}
