package com.sharingfileweb.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 * MongoDB configuration using explicit MongoClient bean.
 *
 * The connection URI is read from the SPRING_DATA_MONGODB_URI environment variable
 * (set via docker-compose environment block). This bean is created before any
 * Spring Boot auto-configuration runs, ensuring the correct host (mongodb:27017
 * inside the Docker network) is used instead of the localhost default.
 */
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${SPRING_DATA_MONGODB_URI:mongodb://localhost:27017}")
    private String mongoUri;

    @Value("${SPRING_DATA_MONGODB_DATABASE:sharingfileweb}")
    private String mongoDatabase;

    @Override
    protected String getDatabaseName() {
        return mongoDatabase;
    }

    @Override
    @Bean
    public MongoClient mongoClient() {
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(mongoUri))
                .build();
        return MongoClients.create(settings);
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), getDatabaseName());
    }
}
