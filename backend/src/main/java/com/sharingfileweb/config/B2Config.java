package com.sharingfileweb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.backblaze.b2.client.B2StorageClient;
import com.backblaze.b2.client.B2StorageClientFactory;

@Configuration
public class B2Config {

    @Value("${b2.application-key-id}")
    private String applicationKeyId;

    @Value("${b2.application-key}")
    private String applicationKey;

    @Value("${b2.bucket-name}")
    private String bucketName;

    @Value("${b2.bucket-id}")
    private String bucketId;

    @Value("${b2.download-url-expiration-seconds:3600}")
    private int downloadUrlExpirationSeconds;

    @Bean
    public B2StorageClient b2StorageClient() {
        return B2StorageClientFactory.createDefaultFactory()
                .create(applicationKeyId, applicationKey, "SharingFileWeb/1.0");
    }

    public String getBucketName() {
        return bucketName;
    }

    public String getBucketId() {
        return bucketId;
    }

    public int getDownloadUrlExpirationSeconds() {
        return downloadUrlExpirationSeconds;
    }
}
