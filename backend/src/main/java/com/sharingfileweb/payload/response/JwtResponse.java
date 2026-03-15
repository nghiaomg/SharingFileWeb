package com.sharingfileweb.payload.response;

import java.util.List;

public class JwtResponse {
  private String accessToken;
  private String type = "Bearer";
  private String refreshToken;
  private String id;
  private String username;
  private String email;
  private List<String> roles;
  private String subscriptionPlan;
  private long maxStorage;
  private long maxFileSize;

  public JwtResponse(String accessToken, String refreshToken, String id, String username, String email, List<String> roles,
                     String subscriptionPlan, long maxStorage, long maxFileSize) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.subscriptionPlan = subscriptionPlan;
    this.maxStorage = maxStorage;
    this.maxFileSize = maxFileSize;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public void setAccessToken(String accessToken) {
    this.accessToken = accessToken;
  }

  public String getRefreshToken() {
    return refreshToken;
  }

  public void setRefreshToken(String refreshToken) {
    this.refreshToken = refreshToken;
  }

  public String getTokenType() {
    return type;
  }

  public void setTokenType(String tokenType) {
    this.type = tokenType;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public List<String> getRoles() {
    return roles;
  }

  public String getSubscriptionPlan() {
    return subscriptionPlan;
  }

  public void setSubscriptionPlan(String subscriptionPlan) {
    this.subscriptionPlan = subscriptionPlan;
  }

  public long getMaxStorage() {
    return maxStorage;
  }

  public void setMaxStorage(long maxStorage) {
    this.maxStorage = maxStorage;
  }

  public long getMaxFileSize() {
    return maxFileSize;
  }

  public void setMaxFileSize(long maxFileSize) {
    this.maxFileSize = maxFileSize;
  }
}
