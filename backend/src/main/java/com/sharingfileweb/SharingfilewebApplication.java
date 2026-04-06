package com.sharingfileweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class SharingfilewebApplication {

	public static void main(String[] args) {
		// All configuration (MongoDB, JWT, OAuth, B2, SePay, CORS, etc.)
		// is now injected natively by Spring Boot from environment variables
		// set via docker-compose env_file / Kubernetes secrets / etc.
		// No dotenv library needed in production.
		SpringApplication.run(SharingfilewebApplication.class, args);
	}

}
