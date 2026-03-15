package com.sharingfileweb.payload.response;

import java.util.List;

public class UserProfileResponse {
  private String id;
  private String username;
  private String email;
  private List<String> roles;
  private String subscriptionPlan;
  private long maxStorage;
  private long maxFileSize;

  public UserProfileResponse(String id, String username, String email, List<String> roles,
                             String subscriptionPlan, long maxStorage, long maxFileSize) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.subscriptionPlan = subscriptionPlan;
    this.maxStorage = maxStorage;
    this.maxFileSize = maxFileSize;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public List<String> getRoles() {
    return roles;
  }

  public void setRoles(List<String> roles) {
    this.roles = roles;
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
