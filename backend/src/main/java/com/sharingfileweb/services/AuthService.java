package com.sharingfileweb.services;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sharingfileweb.exception.TokenRefreshException;
import com.sharingfileweb.models.ERole;
import com.sharingfileweb.models.RefreshToken;
import com.sharingfileweb.models.Role;
import com.sharingfileweb.models.User;
import com.sharingfileweb.payload.request.LoginRequest;
import com.sharingfileweb.payload.request.SignupRequest;
import com.sharingfileweb.payload.request.TokenRefreshRequest;
import com.sharingfileweb.payload.response.JwtResponse;
import com.sharingfileweb.payload.response.TokenRefreshResponse;
import com.sharingfileweb.repository.RoleRepository;
import com.sharingfileweb.repository.UserRepository;
import com.sharingfileweb.security.jwt.JwtUtils;
import com.sharingfileweb.security.services.RefreshTokenService;
import com.sharingfileweb.security.services.UserDetailsImpl;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    RefreshTokenService refreshTokenService;

    @Autowired
    TurnstileService turnstileService;

    @Value("${sharingfileweb.app.googleClientId}")
    private String googleClientId;

    @Value("${sharingfileweb.app.googleClientSecret}")
    private String googleClientSecret;

    @Value("${sharingfileweb.app.githubClientId}")
    private String githubClientId;

    @Value("${sharingfileweb.app.githubClientSecret}")
    private String githubClientSecret;

    @Value("${sharingfileweb.app.dribbbleClientId}")
    private String dribbbleClientId;

    @Value("${sharingfileweb.app.dribbbleClientSecret}")
    private String dribbbleClientSecret;

    @Value("${sharingfileweb.app.zaloAppId}")
    private String zaloAppId;

    @Value("${sharingfileweb.app.zaloSecretKey}")
    private String zaloSecretKey;

    public JwtResponse loginWithGoogle(String code, String redirectUri) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            String tokenUrl = "https://oauth2.googleapis.com/token";

            org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("client_id", googleClientId);
            body.add("client_secret", googleClientSecret);
            body.add("code", code);
            body.add("grant_type", "authorization_code");
            body.add("redirect_uri", redirectUri);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> tokenRequest = new org.springframework.http.HttpEntity<>(body, headers);

            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> tokenResponse;
            try {
                tokenResponse = restTemplate.exchange(
                        tokenUrl,
                        org.springframework.http.HttpMethod.POST,
                        tokenRequest,
                        new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
                );
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                throw new RuntimeException("Error communicating with Google API: " + e.getResponseBodyAsString(), e);
            }

            java.util.Map<String, Object> tokenPayload = tokenResponse.getBody();
            if (tokenPayload == null || !tokenPayload.containsKey("id_token")) {
                throw new RuntimeException("Failed to get Google ID token");
            }

            String idToken = (String) tokenPayload.get("id_token");

            // 1. Verify idToken directly via GoogleIdTokenVerifier
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new RuntimeException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();
            String email = payload.getEmail();
            String rawName = (String) payload.get("name");
            final String finalName = (rawName != null && !rawName.isBlank()) ? rawName : email.split("@")[0];

            // Tìm hoặc tạo user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User(
                        finalName.replaceAll("\\s+", "_").toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 6),
                        email,
                        encoder.encode(UUID.randomUUID().toString()) // random password
                );
                newUser.setSubscriptionPlan("BASIC");
                newUser.setMaxStorage(5L * 1024 * 1024 * 1024);
                newUser.setMaxFileSize(1024L * 1024 * 1024); // 1GB

                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role not found"));
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                newUser.setRoles(roles);
                return userRepository.save(newUser);
            });

            String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            List<String> roles = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList());

            return new JwtResponse(jwt,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles,
                    user.getSubscriptionPlan(),
                    user.getMaxStorage(),
                    user.getMaxFileSize());
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw e;
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to verify Google ID Token: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Google login error: " + e.getMessage());
        }
    }

    public JwtResponse loginWithGithub(String code, String redirectUri) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // 1. Get access token
            String tokenUrl = "https://github.com/login/oauth/access_token";
            
            java.util.Map<String, String> body = new java.util.HashMap<>();
            body.put("client_id", githubClientId);
            body.put("client_secret", githubClientSecret);
            body.put("code", code);
            body.put("redirect_uri", redirectUri);

            org.springframework.http.HttpHeaders tokenHeaders = new org.springframework.http.HttpHeaders();
            tokenHeaders.set("Accept", "application/json");
            
            org.springframework.http.HttpEntity<java.util.Map<String, String>> tokenRequest = new org.springframework.http.HttpEntity<>(body, tokenHeaders);
            
            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> tokenResponse = restTemplate.exchange(
                    tokenUrl,
                    org.springframework.http.HttpMethod.POST,
                    tokenRequest,
                    new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
            );

            java.util.Map<String, Object> tokenPayload = tokenResponse.getBody();
            if (tokenPayload == null || !tokenPayload.containsKey("access_token")) {
                throw new RuntimeException("Failed to get GitHub access token: " + (tokenPayload != null ? tokenPayload.get("error_description") : "unknown error"));
            }
            
            String accessToken = (String) tokenPayload.get("access_token");

            // 2. Get User Info
            String userUrl = "https://api.github.com/user";
            org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
            userHeaders.set("Authorization", "Bearer " + accessToken);
            org.springframework.http.HttpEntity<String> userReqEntity = new org.springframework.http.HttpEntity<>(userHeaders);
            
            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> userResponse = restTemplate.exchange(
                    userUrl,
                    org.springframework.http.HttpMethod.GET,
                    userReqEntity,
                    new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
            );
            
            java.util.Map<String, Object> userInfo = userResponse.getBody();
            if (userInfo == null) throw new RuntimeException("Failed to fetch GitHub user info");

            String email = (String) userInfo.get("email");
            String username = (String) userInfo.get("login");
            String name = (String) userInfo.get("name");
            
            // 3. If email is null, fetch emails
            if (email == null || email.isBlank()) {
                String emailsUrl = "https://api.github.com/user/emails";
                org.springframework.http.ResponseEntity<java.util.List<java.util.Map<String, Object>>> emailsResponse = restTemplate.exchange(
                        emailsUrl,
                        org.springframework.http.HttpMethod.GET,
                        userReqEntity,
                        new org.springframework.core.ParameterizedTypeReference<java.util.List<java.util.Map<String, Object>>>() {}
                );
                
                java.util.List<java.util.Map<String, Object>> emails = emailsResponse.getBody();
                if (emails != null) {
                    for (java.util.Map<String, Object> emailObj : emails) {
                        Boolean primary = (Boolean) emailObj.get("primary");
                        Boolean verified = (Boolean) emailObj.get("verified");
                        if (primary != null && primary && verified != null && verified) {
                            email = (String) emailObj.get("email");
                            break;
                        }
                    }
                }
            }
            
            if (email == null || email.isBlank()) {
                throw new RuntimeException("No verified primary email found on GitHub");
            }
            
            final String finalEmail = email;
            final String finalName = (name != null && !name.isBlank()) ? name : username;

            // 4. Find or Create User
            User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
                User newUser = new User(
                        finalName.replaceAll("\\s+", "_").toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 6),
                        finalEmail,
                        encoder.encode(UUID.randomUUID().toString()) // random password
                );
                newUser.setSubscriptionPlan("BASIC");
                newUser.setMaxStorage(5L * 1024 * 1024 * 1024);
                newUser.setMaxFileSize(1024L * 1024 * 1024);

                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role not found"));
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                newUser.setRoles(roles);
                return userRepository.save(newUser);
            });

            String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            List<String> roles = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList());

            return new JwtResponse(jwt,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles,
                    user.getSubscriptionPlan(),
                    user.getMaxStorage(),
                    user.getMaxFileSize());

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            throw new RuntimeException("Error communicating with Github API: " + e.getResponseBodyAsString(), e);
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("GitHub login error: " + e.getMessage(), e);
        }
    }

    public JwtResponse loginWithDribbble(String code, String redirectUri) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // 1. Get access token
            String tokenUrl = "https://dribbble.com/oauth/token";
            
            java.util.Map<String, String> body = new java.util.HashMap<>();
            body.put("client_id", dribbbleClientId);
            body.put("client_secret", dribbbleClientSecret);
            body.put("code", code);
            body.put("redirect_uri", redirectUri);

            org.springframework.http.HttpHeaders tokenHeaders = new org.springframework.http.HttpHeaders();
            tokenHeaders.set("Accept", "application/json");
            
            org.springframework.http.HttpEntity<java.util.Map<String, String>> tokenRequest = new org.springframework.http.HttpEntity<>(body, tokenHeaders);
            
            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> tokenResponse = restTemplate.exchange(
                    tokenUrl,
                    org.springframework.http.HttpMethod.POST,
                    tokenRequest,
                    new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
            );

            java.util.Map<String, Object> tokenPayload = tokenResponse.getBody();
            if (tokenPayload == null || !tokenPayload.containsKey("access_token")) {
                throw new RuntimeException("Failed to get Dribbble access token: " + (tokenPayload != null ? tokenPayload.get("error_description") : "unknown error"));
            }
            
            String accessToken = (String) tokenPayload.get("access_token");

            // 2. Get User Info
            String userUrl = "https://api.dribbble.com/v2/user";
            org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
            userHeaders.set("Authorization", "Bearer " + accessToken);
            org.springframework.http.HttpEntity<String> userReqEntity = new org.springframework.http.HttpEntity<>(userHeaders);
            
            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> userResponse = restTemplate.exchange(
                    userUrl,
                    org.springframework.http.HttpMethod.GET,
                    userReqEntity,
                    new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
            );
            
            java.util.Map<String, Object> userInfo = userResponse.getBody();
            if (userInfo == null) throw new RuntimeException("Failed to fetch Dribbble user info");

            String username = (String) userInfo.get("login");
            String name = (String) userInfo.get("name");
            
            if (username == null || username.isBlank()) {
                throw new RuntimeException("Dribbble returned invalid user profile without login alias.");
            }
            
            // Dribbble does not return email. Create a mock verified email.
            final String finalEmail = username + "@dribbble.user";
            final String finalName = (name != null && !name.isBlank()) ? name : username;

            // 4. Find or Create User
            User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
                User newUser = new User(
                        finalName.replaceAll("\\s+", "_").toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 6),
                        finalEmail,
                        encoder.encode(UUID.randomUUID().toString()) // random password
                );
                newUser.setSubscriptionPlan("BASIC");
                newUser.setMaxStorage(5L * 1024 * 1024 * 1024);
                newUser.setMaxFileSize(1024L * 1024 * 1024);

                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role not found"));
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                newUser.setRoles(roles);
                return userRepository.save(newUser);
            });

            String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            List<String> roles = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList());

            return new JwtResponse(jwt,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles,
                    user.getSubscriptionPlan(),
                    user.getMaxStorage(),
                    user.getMaxFileSize());

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            throw new RuntimeException("Error communicating with Dribbble API: " + e.getResponseBodyAsString(), e);
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Dribbble login error: " + e.getMessage(), e);
        }
    }

    public JwtResponse loginWithZalo(String code, String redirectUri) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // 1. Get access token from Zalo
            String tokenUrl = "https://oauth.zaloapp.com/v4/access_token";

            org.springframework.http.HttpHeaders tokenHeaders = new org.springframework.http.HttpHeaders();
            tokenHeaders.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
            tokenHeaders.set("secret_key", zaloSecretKey);

            org.springframework.util.MultiValueMap<String, String> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("app_id", zaloAppId);
            body.add("grant_type", "authorization_code");
            body.add("code", code);

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> tokenRequest = new org.springframework.http.HttpEntity<>(body, tokenHeaders);

            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> tokenResponse = restTemplate.exchange(
                    tokenUrl,
                    org.springframework.http.HttpMethod.POST,
                    tokenRequest,
                    new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
            );

            java.util.Map<String, Object> tokenPayload = tokenResponse.getBody();
            if (tokenPayload == null || !tokenPayload.containsKey("access_token")) {
                throw new RuntimeException("Failed to get Zalo access token: " + (tokenPayload != null ? tokenPayload.get("error_name") : "unknown error"));
            }

            String accessToken = (String) tokenPayload.get("access_token");

            // 2. Get User Info from Zalo
            String userUrl = "https://graph.zalo.me/v2.0/me?fields=id,name,picture";
            org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
            userHeaders.set("access_token", accessToken);
            org.springframework.http.HttpEntity<String> userReqEntity = new org.springframework.http.HttpEntity<>(userHeaders);

            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> userResponse = restTemplate.exchange(
                    userUrl,
                    org.springframework.http.HttpMethod.GET,
                    userReqEntity,
                    new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {}
            );

            java.util.Map<String, Object> userInfo = userResponse.getBody();
            if (userInfo == null) throw new RuntimeException("Failed to fetch Zalo user info");

            // Check if Zalo returned an error inside the map
            if (userInfo.containsKey("error")) {
                throw new RuntimeException("Zalo Graph API error: " + userInfo.get("message"));
            }

            String idStr = (String) userInfo.get("id");
            String name = (String) userInfo.get("name");

            if (idStr == null || idStr.isBlank()) {
                throw new RuntimeException("Zalo returned invalid user profile without ID.");
            }

            // 3. Mock Email for Zalo User
            final String finalEmail = "zalo_" + idStr + "@zalo.user";
            final String finalName = (name != null && !name.isBlank()) ? name : "Zalo User_" + idStr.substring(0, 4);

            // 4. Find or Create User
            User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
                User newUser = new User(
                        "zalo" + "_" + UUID.randomUUID().toString().substring(0, 8),
                        finalEmail,
                        encoder.encode(UUID.randomUUID().toString()) // random password
                );
                newUser.setSubscriptionPlan("BASIC");
                newUser.setMaxStorage(5L * 1024 * 1024 * 1024);
                newUser.setMaxFileSize(1024L * 1024 * 1024);

                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Role not found"));
                Set<Role> roles = new HashSet<>();
                roles.add(userRole);
                newUser.setRoles(roles);
                return userRepository.save(newUser);
            });

            String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            List<String> roles = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toList());

            return new JwtResponse(jwt,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles,
                    user.getSubscriptionPlan(),
                    user.getMaxStorage(),
                    user.getMaxFileSize());

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            throw new RuntimeException("Error communicating with Zalo API: " + e.getResponseBodyAsString(), e);
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Zalo login error: " + e.getMessage(), e);
        }
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
             .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại."));

        if (user.getLockoutEnd() != null && user.getLockoutEnd().isAfter(java.time.Instant.now())) {
             long minutes = java.time.Duration.between(java.time.Instant.now(), user.getLockoutEnd()).toMinutes();
             if (minutes <= 0) minutes = 1;
             throw new RuntimeException("Tài khoản đang tạm khóa do sai mật khẩu quá nhiều lần. Vui lòng thử lại sau " + minutes + " phút.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            // Khôi phục nếu đăng nhập thành công
            if (user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) {
                user.setFailedLoginAttempts(0);
                user.setLockoutEnd(null);
                userRepository.save(user);
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

            return new JwtResponse(jwt,
                    refreshToken.getToken(),
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    roles,
                    userDetails.getSubscriptionPlan(),
                    userDetails.getMaxStorage(),
                    userDetails.getMaxFileSize());
                    
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);
            
            long lockMinutes = fibonacci(attempts);
            user.setLockoutEnd(java.time.Instant.now().plusSeconds(lockMinutes * 60));
            userRepository.save(user);
            
            throw new RuntimeException("Sai mật khẩu. Lỗi " + attempts + " lần. " +
               "Tài khoản bị khóa " + lockMinutes + " phút.");
        }
    }

    private long fibonacci(int n) {
        if (n <= 0) return 0;
        if (n == 1 || n == 2) return 1;
        long a = 1, b = 1;
        for (int i = 3; i <= n; i++) {
             long temp = a + b;
             a = b;
             b = temp;
        }
        return b;
    }

    public void registerUser(SignupRequest signUpRequest) {
        // Verify Turnstile token
        if (!turnstileService.verifyToken(signUpRequest.getTurnstileToken())) {
            throw new RuntimeException("Xác thực Turnstile thất bại. Vui lòng thử lại.");
        }

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
             throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
             throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        // Thiết lập mặc định
        user.setSubscriptionPlan("BASIC");
        user.setMaxStorage(5L * 1024 * 1024 * 1024); // 5GB
        user.setMaxFileSize(1024L * 1024 * 1024); // 1GB

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getUsername());
                    return new TokenRefreshResponse(token, requestRefreshToken);
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database!"));
    }

    public void logoutUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = userDetails.getId();
        refreshTokenService.deleteByUserId(userId);
    }
}
