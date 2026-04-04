package com.sharingfileweb.config;

import org.springframework.context.annotation.Configuration;

/**
 * MongoDB is configured entirely via Spring Boot auto-configuration
 * using properties from application.properties:
 *   spring.data.mongodb.uri=${MONGO_URI}
 *   spring.data.mongodb.database=${MONGO_DATABASE}
 *
 * These placeholders are resolved from environment variables set in
 * SharingfilewebApplication.main() (via dotenv).
 *
 * Spring Boot's MongoDataAutoConfiguration automatically creates the
 * MongoClient bean, which is then available for @Autowired injection
 * in MongoMigrationRunner and other components.
 */
@Configuration
public class MongoConfig {
}
