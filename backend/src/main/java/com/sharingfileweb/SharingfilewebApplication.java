package com.sharingfileweb;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Properties;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class SharingfilewebApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().directory("./").ignoreIfMissing().load();
		Properties properties = new Properties();

		dotenv.entries().forEach(entry -> {
			String key = entry.getKey();
			String value = entry.getValue();
			System.setProperty(key, value);
			properties.put(key, value);

			// Forward MongoDB config to Spring Boot Data MongoDB auto-configuration
			// Set as SYSTEM property (not just default property) so it is read during
			// auto-config phase, which happens before default properties are applied.
			if ("MONGO_URI".equals(key)) {
				System.setProperty("spring.data.mongodb.uri", value);
				properties.put("spring.data.mongodb.uri", value);
			}
			if ("MONGO_DATABASE".equals(key)) {
				System.setProperty("spring.data.mongodb.database", value);
				properties.put("spring.data.mongodb.database", value);
			}
		});

		SpringApplication application = new SpringApplication(SharingfilewebApplication.class);
		application.setDefaultProperties(properties);
		application.run(args);
	}

}
