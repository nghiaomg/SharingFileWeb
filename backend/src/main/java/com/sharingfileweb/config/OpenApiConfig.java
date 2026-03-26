package com.sharingfileweb.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "SharingFileWeb API Documentation",
        version = "1.0",
        description = "API Documentation cho hệ thống SharingFileWeb (từ Admin đến User)."
    ),
    security = @SecurityRequirement(name = "bearerAuth") // Mặc định yêu cầu auth cho toàn bộ API (ngoại trừ các endpoint cho phép public)
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Nhập JWT Token lấy từ API /api/auth/signin."
)
public class OpenApiConfig {
}
