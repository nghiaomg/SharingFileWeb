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

    @Value("${sharingfileweb.app.googleClientId}")
    private String googleClientId;

    public JwtResponse loginWithGoogle(String idToken) {
        try {
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
            throw e;
        } catch (IOException e) {
            throw new RuntimeException("Failed to verify Google ID Token: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Google login error: " + e.getMessage());
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
