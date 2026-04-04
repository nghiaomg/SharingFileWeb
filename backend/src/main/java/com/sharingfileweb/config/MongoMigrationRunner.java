package com.sharingfileweb.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Chạy một lần khi khoi dong app de migrate MongoDB schema.
 * Them cac field moi cho Private Bucket Access Model.
 *
 * <p>Script nay chay idempotent — an toan khi chay lai nhieu lan.
 */
@Component
@Order(100)
public class MongoMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MongoMigrationRunner.class);

    @Autowired
    private MongoClient mongoClient;

    @Override
    public void run(ApplicationArguments args) {
        try {
            String dbName = System.getProperty("MONGO_DATABASE", "sharingfileweb");
            MongoDatabase db = mongoClient.getDatabase(dbName);
            runMigrations(db);
        } catch (Exception e) {
            log.error("[Migration] Failed to run MongoDB migrations: {}", e.getMessage(), e);
        }
    }

    private void runMigrations(MongoDatabase db) {
        // Migration 1: Add version and contentHash to storage_files
        try {
            Document filter = new Document("$or", List.of(
                    new Document("version", new Document("$exists", false)),
                    new Document("version", null)
            ));
            Document update = new Document("$set", new Document("version", 1L).append("contentHash", null));
            db.getCollection("storage_files").updateMany(filter, update);
            log.info("[Migration] storage_files: added version, contentHash");
        } catch (Exception e) {
            log.warn("[Migration] storage_files: {}", e.getMessage());
        }

        // Migration 2: Add viewCount to share_links
        try {
            Document filter = new Document("viewCount", new Document("$exists", false));
            Document update = new Document("$set", new Document("viewCount", 0L));
            db.getCollection("share_links").updateMany(filter, update);
            log.info("[Migration] share_links: added viewCount");
        } catch (Exception e) {
            log.warn("[Migration] share_links: {}", e.getMessage());
        }

        // Migration 3: Add expiresAt to shared_access
        try {
            Document filter = new Document("expiresAt", new Document("$exists", false));
            Document update = new Document("$set", new Document("expiresAt", null));
            db.getCollection("shared_access").updateMany(filter, update);
            log.info("[Migration] shared_access: added expiresAt");
        } catch (Exception e) {
            log.warn("[Migration] shared_access: {}", e.getMessage());
        }

        // Migration 4: Add deprecated sharing fields to folders
        try {
            Document filter = new Document("accessMode", new Document("$exists", false));
            Document update = new Document("$set", new Document("accessMode", "PRIVATE")
                    .append("sharedEmails", List.of())
                    .append("shareExpiresAt", null));
            db.getCollection("folders").updateMany(filter, update);
            log.info("[Migration] folders: added deprecated sharing fields");
        } catch (Exception e) {
            log.warn("[Migration] folders: {}", e.getMessage());
        }

        log.info("[Migration] Private Bucket Access Model migrations completed");
    }
}
