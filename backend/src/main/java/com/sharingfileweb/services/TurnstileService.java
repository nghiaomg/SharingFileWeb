package com.sharingfileweb.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

@Service
public class TurnstileService {

    @Value("${cloudflare.turnstile.secret}")
    private String turnstileSecret;

    private static final String TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final RestTemplate restTemplate;

    public TurnstileService() {
        this.restTemplate = new RestTemplate();
    }

    public boolean verifyToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("secret", turnstileSecret);
        map.add("response", token);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(TURNSTILE_VERIFY_URL, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && Boolean.TRUE.equals(body.get("success"))) {
                return true;
            }
        } catch (Exception e) {
            System.err.println("Turnstile verification error: " + e.getMessage());
        }
        return false;
    }
}
