package com.sharingfileweb.security.services;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sharingfileweb.models.User;

public class UserDetailsImpl implements UserDetails {
  private static final long serialVersionUID = 1L;

  private String id;
  private String username;
  private String email;

  @JsonIgnore
  private String password;

  private String subscriptionPlan;
  private long maxStorage;
  private long maxFileSize;
  
  private boolean locked;
  private boolean deleted;

  private Collection<? extends GrantedAuthority> authorities;

  public UserDetailsImpl(String id, String username, String email, String password,
      String subscriptionPlan, long maxStorage, long maxFileSize,
      boolean locked, boolean deleted,
      Collection<? extends GrantedAuthority> authorities) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.subscriptionPlan = subscriptionPlan;
    this.maxStorage = maxStorage;
    this.maxFileSize = maxFileSize;
    this.locked = locked;
    this.deleted = deleted;
    this.authorities = authorities;
  }

  public static UserDetailsImpl build(User user) {
    List<GrantedAuthority> authorities = user.getRoles().stream()
        .map(role -> new SimpleGrantedAuthority(role.getName().name()))
        .collect(Collectors.toList());

    return new UserDetailsImpl(
        user.getId(), 
        user.getUsername(), 
        user.getEmail(),
        user.getPassword(), 
        user.getSubscriptionPlan(),
        user.getMaxStorage(),
        user.getMaxFileSize(),
        user.isLocked(),
        user.isDeleted(),
        authorities);
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return authorities;
  }

  public String getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public String getUsername() {
    return username;
  }

  public String getSubscriptionPlan() {
    return subscriptionPlan;
  }

  public long getMaxStorage() {
    return maxStorage;
  }

  public long getMaxFileSize() {
    return maxFileSize;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return !locked;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return !deleted;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;
    UserDetailsImpl user = (UserDetailsImpl) o;
    return Objects.equals(id, user.id);
  }
}
