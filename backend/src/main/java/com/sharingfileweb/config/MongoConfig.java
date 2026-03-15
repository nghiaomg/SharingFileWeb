package com.sharingfileweb.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        String db = System.getProperty("MONGO_DATABASE");
        return db != null ? db : "sharingfileweb";
    }

    @Override
    public MongoClient mongoClient() {
        String uri = System.getProperty("MONGO_URI");
        if (uri == null) {
            uri = "mongodb://localhost:27017/sharingfileweb";
        }
        return MongoClients.create(uri);
    }
}
