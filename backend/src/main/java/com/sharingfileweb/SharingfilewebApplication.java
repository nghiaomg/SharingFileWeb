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
			System.setProperty(entry.getKey(), entry.getValue());
			properties.put(entry.getKey(), entry.getValue());
			if (entry.getKey().equals("MONGO_URI")) {
				properties.put("spring.data.mongodb.uri", entry.getValue());
			}
			if (entry.getKey().equals("MONGO_DATABASE")) {
				properties.put("spring.data.mongodb.database", entry.getValue());
			}
		});

		SpringApplication application = new SpringApplication(SharingfilewebApplication.class);
		application.setDefaultProperties(properties);
		application.run(args);
	}

}
